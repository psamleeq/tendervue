<template>
	<div class="app-container perfReportD-List" v-loading="loading">
		<h2>日報表 - 列表</h2>
		<div class="filter-container">
			<el-select class="filter-item" v-model="listQuery.zipCode" :disabled="Object.keys(districtList).length <= 1">
				<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="Number(zip)" />
			</el-select>
			<span class="filter-item">
				<div style="font-size: 12px; color: #909399">報告日期</div>
				<time-picker class="filter-item" shortcutType="day" :timeTabId.sync="timeTabId" :dateRange.sync="dateRange" @search="getList"/>
			</span>

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
			<el-button @click="showNewPdf = true" type="success" icon="el-icon-plus">新增</el-button>
		</div>
		

		<el-dialog width="400px" title="新增" :visible.sync="showNewPdf">
			<div>
				<el-form :model="addList" label-width="80px">
					<el-form-item label="行政區">
						<el-select class="filter-item" v-model="addList.zipCode" :disabled="Object.keys(districtList).length <= 1" style="width: 250px;margin-bottom:15px">
							<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="Number(zip)" />
						</el-select>
					</el-form-item>
					<el-form-item label="報告日期">
						<el-date-picker
							v-model="addList.searchDate"
							type="date"
							placeholder="日期"
							:picker-options="pickerOptions"
							:clearable="false"
							style="width: 250px"
						/>
					</el-form-item>
				</el-form>
				
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="showNewPdf = false">取消</el-button>
				<el-button type="primary" @click="addNewPdf()">確定</el-button>
			</div>
		</el-dialog>

		<div class="filter-container">
			<el-table 
			:data="list"
			empty-text="目前沒有資料"
			border
			fit
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%"
			>
				<el-table-column type="index" label="序號" width="60" align="center" />
				<el-table-column prop="reportDate" label="報告日期" :formatter="formatDate" align="center" />
				<el-table-column prop="dutyWithName" label="編輯人員" align="center" />
				<el-table-column label="進度" align="center">
					<template slot-scope="{ row }">
						<span :style="row.contentFin == row.contentTotal ? 'color: #67C23A' : 'color: #F56C6C'">{{ row.contentFin }}</span><span> / {{ row.contentTotal }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="dateComplete_At" label="完成日期" :formatter="formatDate" align="center" />
				<el-table-column label="動作" align="center">
					<template slot-scope="{ row }">
						<el-button-group>
							<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
							<el-button type="info" plain size="mini" :disabled="row.contentFin != row.contentTotal" @click="previewPdf(row)" ><i class="el-icon-download"></i>下載</el-button>
						</el-button-group>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- Dialog: PDF預覽 -->
		<el-dialog width="800px" title="預覽" :visible.sync="showPdfDialog">
			<div ref="pdfViewer" />
			<div slot="footer" class="dialog-footer">
				<el-button @click="showPdfDialog = false">取消</el-button>
				<el-button type="primary" @click="handleDownload()">下載</el-button>
			</div>
		</el-dialog>
		
		<PI21 v-show="false" ref="PI21" />
		<PI21Att v-show="false" ref="PI21Att" />
		<PI21Att2 v-show="false" ref="PI21Att2" />
		<PI31 v-show="false" ref="PI31" />
		<PI31Att v-show="false" ref="PI31Att" />
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { PDFDocument } from 'pdf-lib';
import { generate } from '@pdfme/generator';
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getPerfReport, addPerfReport, getPerfReportList } from "@/api/PI";
import TimePicker from '@/components/TimePicker';
import { dateWatcher } from "@/utils/pickerOptions";
import PI21 from '@/views/PI/perfReportD/PI2_1.vue';
import PI21Att from '@/views/PI/perfReportD/PI2_1_Att.vue';
import PI21Att2 from '@/views/PI/perfReportD/PI2_1_Att_2.vue';
import PI31 from '@/views/PI/perfReportD/PI3_1.vue';
import PI31Att from '@/views/PI/perfReportD/PI3_1_Att.vue';

export default {
	name: "perfReportDList",
	components:{ TimePicker, PI21, PI21Att, PI21Att2, PI31, PI31Att },
	data() {
		return {
			loading: false,
			showNewPdf:false,
			timeTabId: 4,
			dateRange: [ moment().startOf("month").toDate(), moment().endOf("month").toDate() ],
			showPdfDialog: true,
			pickerOptions: {
				firstDayOfWeek: 1,
				shortcuts: [
					{
						text: "今日",
						onClick(picker) {
							const date = moment();
							picker.$emit("pick", date);
						},
					},
					{
						text: "昨日",
						onClick(picker) {
							const date = moment().subtract(1, "d");
							picker.$emit("pick", date);
						}
					},
					{
						text: "前日",
						onClick(picker) {
							const date = moment().subtract(2, "d");
							picker.$emit("pick", date);
						}
					}
				],
				disabledDate(date) {
					return moment(date).valueOf() >= moment().endOf("d").valueOf();
				},
			},
			addList:{
				zipCode: 104,
				searchDate: moment().startOf("d").subtract(1, "d"),
			},
			listQuery:{
				zipCode: 104
			},
			districtList: {
				// 100: {
				// 	"name": "中正區"
				// },
				103: {
					"name": "大同區"
				},
				104: {
					"name": "中山區"
				},
				// 105: {
				// 	"name": "松山區"
				// },
				// 106: {
				// 	"name": "大安區"
				// },
				// 108: {
				// 	"name": "萬華區"
				// },
				// 110: {
				// 	"name": "信義區"
				// },
				// 111: {
				// 	"name": "士林區"
				// },
				// 112: {
				// 	"name": "北投區"
				// },
				// 114: {
				// 	"name": "內湖區"
				// },
				// 115: {
				// 	"name": "南港區"
				// },
				// 116: {
				// 	"name": "文山區"
				// }
			},
			template:{},
			list:[],
			listContent:[]
			// result: ''
		};
	},
	computed: { },
	watch: { },
	mounted() { 
		this.showPdfDialog = false;
		this.getList();
	},
	methods: {
		formatDate(row,column){
			const propertyName = column.property;

			if (propertyName === 'dateComplete_At'&& row.propertyName!=null) {
				return moment(row.dateComplete_At).format('YYYY-MM-DD');
			} else if (propertyName === 'reportDate') {
				return moment(row.reportDate).format('YYYY-MM-DD');
			}
			
			return '-';
		},
		getList() {
			this.loading = true;
			dateWatcher(this.districtList[this.listQuery.zipCode].start, this.dateRange);
			let startDate = moment(this.dateRange[0]).format("YYYY-MM-DD");
			let endDate = moment(this.dateRange[1]).format("YYYY-MM-DD");
			this.searchRange = startDate + " - " + endDate;
			this.list = [];

			getPerfReport({
				zipCode: this.listQuery.zipCode,
				reportType:1,
				timeStart: startDate,
				timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
		addNewPdf(){
			addPerfReport({
				zipCode: this.addList.zipCode,
				reportType: 1,
				reportDate: moment(this.addList.searchDate).format('YYYY-MM-DD'),//報告日期
				perfItems: [
					{
						"perfItem": 201,
						"perfAtt": [0,1,2],
						"perfPages": []
					},
					{
						"perfItem": 301,
						"perfAtt": [0,1],
						"perfPages": []
					}
				]
			}).then((response) => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "新增成功",
						type: "success",
					});
				}
				this.getList();
				this.loading = false;
			}).catch(error => { 
				let messageText = error.response.data.message;
				if (messageText) {
					switch (messageText) {
						case "Duplicate!":
							messageText = "重複";
							break;
					}
					this.$message({
						message: messageText,
						type: "error",
					});
				}
				this.loading = false; 
			});
			this.showNewPdf = false;
			this.getList();
		},
		beforeEdit(row){
			// console.log(row);
			this.$router.push({
				path: "/PIIndex/perfReportD/edit",
				query: { reportId: row.id }
			})
		},
		async previewPdf(row) {
			this.loading = true;
			
			await getPerfReportList({
				reportId: row.id
			}).then(async (response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.listContent = response.data.list;
					const reportInfo = response.data.reportInfo;

					// 代入個別報表
					await this.$refs.PI21.setData(Object.assign(this.listContent[0], { reportDate: reportInfo.reportDate, zipCode: String(reportInfo.zipCode) }));
					await this.$refs.PI21Att.setData(Object.assign(this.listContent[1], { reportDate: reportInfo.reportDate, zipCode: String(reportInfo.zipCode) }));
					await this.$refs.PI21Att2.setData(Object.assign(this.listContent[2], { reportDate: reportInfo.reportDate, zipCode: String(reportInfo.zipCode) }));
					await this.$refs.PI31.setData(Object.assign(this.listContent[3], { reportDate: reportInfo.reportDate, zipCode: String(reportInfo.zipCode) }));
					await this.$refs.PI31Att.setData(Object.assign(this.listContent[4], { reportDate: reportInfo.reportDate, zipCode: String(reportInfo.zipCode) }));

					//處理serialNumber
					// console.log(this.inputs);
					// this.inputs
					
				}
				this.loading = false;
				this.fetchPdf();
				this.showPdfDialog = true;
			}).catch(err => { this.loading = false; });

			
		},
		async fetchPdf(){
			const domContainer = this.$refs.pdfViewer;
			this.template = { "schemas": [], "basePdf": "" };
			
			const add_pdfUint8_21 = await this.$refs.PI21.getPDF();
			const add_pdfUint8_21Att = await this.$refs.PI21Att.getPDF();
			const add_arrayBuffer_21Att2 = await this.$refs.PI21Att2.getPDF();
			const add_pdfUint8_31 = await this.$refs.PI31.getPDF();
			const add_pdfUint8_31Att = await this.$refs.PI31Att.getPDF(); 

			const add_pdf_21 = await PDFDocument.load(add_pdfUint8_21.buffer);
			const add_pdf_21Att = await PDFDocument.load(add_pdfUint8_21Att.buffer);
			const add_pdf_21Att2 = await PDFDocument.load(add_arrayBuffer_21Att2);
			const add_pdf_31 = await PDFDocument.load(add_pdfUint8_31.buffer);
			const add_pdf_31Att = await PDFDocument.load(add_pdfUint8_31Att.buffer);

			const mergedPdf = await PDFDocument.create();
			const add_copiedPage_21 = await mergedPdf.copyPages(add_pdf_21, add_pdf_21.getPageIndices());
			const add_copiedPage_21Att = await mergedPdf.copyPages(add_pdf_21Att, add_pdf_21Att.getPageIndices());
			const add_copiedPage_21Att2 = await mergedPdf.copyPages(add_pdf_21Att2, add_pdf_21Att2.getPageIndices());
			const add_copiedPage_31 = await mergedPdf.copyPages(add_pdf_31, add_pdf_31.getPageIndices());
			const add_copiedPage_31Att = await mergedPdf.copyPages(add_pdf_31Att, add_pdf_31Att.getPageIndices());
			
			for(const copiedPage of add_copiedPage_21) mergedPdf.addPage(copiedPage);
			for(const copiedPage of add_copiedPage_21Att) mergedPdf.addPage(copiedPage);
			for(const copiedPage of add_copiedPage_21Att2) mergedPdf.addPage(copiedPage);
			for(const copiedPage of add_copiedPage_31) mergedPdf.addPage(copiedPage);
			for(const copiedPage of add_copiedPage_31Att) mergedPdf.addPage(copiedPage);

			this.template.basePdf = await mergedPdf.saveAsBase64({ dataUri: true });

			const font = {
				edukai: {
					data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
					fallback: true
				},
			};
			this.viewer = new Viewer({ domContainer, template: this.template, inputs: [{}], options: { font } });
		},
		handleDownload() {
			this.showPdfDialog = false;
			generate({ template: this.viewer.getTemplate(), inputs: [{}], options: { font: this.viewer.getFont() } }).then(pdf => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const file = new File([blob], `日報表.pdf`, { type: 'application/pdf' });
				const link = document.createElement('a');
				const url = URL.createObjectURL(file);
				link.href = url;
				link.download = file.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			});
		},
		
	}
};
</script>

<style lang="sass">
</style>