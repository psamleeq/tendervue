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
				<el-table-column
					type="index"
					label="序號"
					width="60"
					align="center">
				</el-table-column>
				<el-table-column
					prop="reportDate"
					label="報告日期"
					:formatter="formatDate"
					align="center">
				</el-table-column>
				<el-table-column
					prop="dutyWithName"
					label="編輯人員"
					align="center">
				</el-table-column>
				<el-table-column
					prop="dateComplete_At"
					label="完成日期"
					:formatter="formatDate"
					align="center">
				</el-table-column>
				<el-table-column label="動作" align="center">
					<template slot-scope="{ row }">
						<el-button-group>
							<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
							<el-button type="info" plain size="mini" @click="previewPdf(row)" ><i class="el-icon-download"></i>下載</el-button>
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
				<el-button type="primary" @click="downloadPdf()">確定列印</el-button>
			</div>
		</el-dialog>
		
		<PI21Att2 ref="PI21Att2" :message="message" style="display:none"></PI21Att2>
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
// import PI21Att2 from '@/views/PI/perfReport/component/PI21Att2.vue'
import PI21Att2 from '@/views/PI/perfReportD/PI2_1_Att_2.vue'

export default {
	name: "perfReportDList",
	components:{ PI21Att2, TimePicker },
	data() {
		return {
			message:{
				zipCode:103,
				searchDate:'2023-07-18',
				startDate:'2023-06-01',
				endDate:'2023-06-01',
				imageUrl:'',
				initPage:3,
			},
			loading: false,
			showNewPdf:false,
			timeTabId: 4,
			dateRange: [ moment().startOf("month").toDate(), moment().endOf("month").toDate() ],
			showPdfDialog:false,
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
			listContent:[],
			inputs: {
				//共同
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				// serialNumber: '',
				date: '111年11月02日',
				zipCode: '104',
				district: '中山區',

				//PI3.1_Att
				serialNumber1:'',
				serialNumber2:'',
				serialNumber3:'',
				checkVest1: 'V',		// 反光背心
				checkIdCard1: 'V',	// 識別證
				checkWhistle1: 'V',	// 哨子
				checkVest2: 'V',
				checkIdCard2: 'V',	
				checkWhistle2: 'V',	// 工程帽
				checkNum1: '0',
				passNum1: '0',
				failNum1: '0',
				reason1: '無',
				checkNum2: '0',
				passNum2: '0',
				failNum2: '0',
				reason2: '無',
				info1: '無未滿足',
				info2: '無未滿足',
				info3: '無未滿足',


				//PI3.1
				serialNumber_31:'',
				requiredStandard_31:'廠商人員執行工作應滿足安全性要求',//要求標準
				measurement_31:'當天滿足要求人次數/當日工作執行日報填寫人數',//量測方式
				dailyReport_Num31: '0 件',//A
				qualifiedSafety_Num31: '0 件',//B
				unqualifiedSafety_Num31: '0 件',//C
				companyCheck_Num31:'0 件',
				BCA_31:'',
				checkCo_dailyInspectAll31:'',
				checkCo_discoverUnSafety31:'',
				checkOr_discoverUnSafety31:'',
				checkCo_unreasonable31:'',

				//PI2.1_Att_3
				
				info1_21Att: '無',
				info2_21Att: '無',

				//PI2.1_Att_1
				serialNumber_21Att_1:'',
				serialNumber_21Att_2:'',
				caseReportTotal: '0',
				ACTotal_Obs: '0',
				ACTotal_Reg: '0',
				facTotal_Obs: '0',
				facTotal_Reg: '0',
				caseReportImg:'',
				caseReportImg_neo1:'',
				caseReportImg_neo2:'',
				caseReportImg_neo3:'',

				//PI2.1
				serialNumber_21Main:'',
				requiredStandard_21:'完成巡查工作後必須及時登錄資料',//要求標準
				measurement_21:'廠商於系統當天登錄資料數量/廠商當天通報數',//量測方式
				sumInform_Num21: '0件',//A
				informed_Num21: '0件',//B
				companyInform_Num21: '0件',//C
				unreasonable_Num21: '0件',//D
				roadSystem_Num21:'0件',//E
				incomplete_Num21: '0件',//F
				companyCheck_Num21: '0件',
				EFA_21:'',
				checkCo_dailyInform21:'',
				checkCo_dailyLogin21:'',
				checkPeriod_Complete21:'',
				checkPeriod_IncompleteLogin21:'',
			},
			targetId:null
			// result: ''
		};
	},
	computed: { },
	watch: { },
	mounted() { 
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
				zipCode:this.addList.zipCode,
				reportType:1,
				reportDate:moment(this.addList.searchDate).format('YYYY-MM-DD'),//報告日期
				perfItems:[
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
			}).catch(err => { this.loading = false; });
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
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.listContent = response.data.list;
					this.targetId = this.listContent.find(obj => obj.perfItem === 201 && obj.perfAtt === 2).id;
					
					//把獲取回來的資料填進this.inputs
					const mappedContents = this.listContent.map(l => l.content.inputs).filter(content => content !== undefined);
					// console.log(mappedContents);
					for (const obj of mappedContents) {
						for (const key in obj) {
							if (this.inputs.hasOwnProperty(key)) {
								this.inputs[key] = obj[key];
							}
						}
					}

					//處理serialNumber
					// console.log(this.inputs);
					// this.inputs
					
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
			
			//找到PI2.1附件-2那個obj，並獲取其id
			await this.$refs.PI21Att2.init(this.targetId);
			// console.log(this.$refs.PI21Att2);
			setTimeout(()=>{
				this.fetchPdf();
			}, 1000)
			this.showPdfDialog = true;
		},
		fetchPdf(){
			fetch(`/assets/pdf/PI3_1-Att.json?t=${Date.now()}`).then(async (response) => {
				const domContainer = this.$refs.pdfViewer;
				this.template = await response.json();
				//PI3.1
				//Step1: 合併PDF
				const ori_pdfUint8_1 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const ori_pdf = await PDFDocument.load(ori_pdfUint8_1.buffer);

				const addTemplate13Att = await fetch(`/assets/pdf/PI3_1-Att_2.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_1 = await fetch(`/assets/pdf/PI3_1-Main.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_2 = await fetch(`/assets/pdf/PI2_1-Att_3.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_3 = await fetch(`/assets/pdf/PI2_1-Att.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_4 = await fetch(`/assets/pdf/PI2_1-Main.json?t=${Date.now()}`).then(response => response.json());
				// console.log(addTemplate_1);
				
				const add_pdfUint8_13Att = Uint8Array.from(window.atob(addTemplate13Att.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_1 = Uint8Array.from(window.atob(addTemplate_1.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_2 = Uint8Array.from(window.atob(addTemplate_2.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_jspdf = Uint8Array.from(window.atob(this.$refs.PI21Att2.result.replace(/^data:application\/pdf;filename=generated.pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_3 = Uint8Array.from(window.atob(addTemplate_3.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_4 = Uint8Array.from(window.atob(addTemplate_4.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));

				const add_pdf_13Att = await PDFDocument.load(add_pdfUint8_13Att.buffer);
				const add_pdf_1 = await PDFDocument.load(add_pdfUint8_1.buffer);
				const add_pdf_2 = await PDFDocument.load(add_pdfUint8_2.buffer);
				const add_pdf_jspdf = await PDFDocument.load(add_pdfUint8_jspdf.buffer);
				const add_pdf_3 = await PDFDocument.load(add_pdfUint8_3.buffer);
				const add_pdf_4 = await PDFDocument.load(add_pdfUint8_4.buffer);

				const mergedPdf = await PDFDocument.create();

				const ori_copiedPages_1 = await mergedPdf.copyPages(ori_pdf, ori_pdf.getPageIndices());

				const [ add_copiedPage_13Att ] = await mergedPdf.copyPages(add_pdf_13Att, [0]);
				const [ add_copiedPage_1 ] = await mergedPdf.copyPages(add_pdf_1, [0]);
				const [ add_copiedPage_2 ] = await mergedPdf.copyPages(add_pdf_2, [0]);
				const [ add_copiedPagef_jspdf1,add_copiedPagef_jspdf2 ] = await mergedPdf.copyPages(add_pdf_jspdf, [0,1]);
				const [ add_copiedPage_3 ] = await mergedPdf.copyPages(add_pdf_3, [0]);
				const [ add_copiedPage_4 ] = await mergedPdf.copyPages(add_pdf_4, [0]);

				ori_copiedPages_1.forEach(page => mergedPdf.addPage(page));
				// console.log(this.listContent);
				if(this.listContent[4].content.inputForm.length>1){
					for (let i = 0; i < this.listContent[4].content.inputForm.length-2; i++) {
						console.log(i);
						// const element = array[index];
						
					}
					mergedPdf.insertPage(ori_pdf.getPageCount()-1, add_copiedPage_13Att);
				}
				mergedPdf.insertPage(0, add_copiedPage_1);//PI13-Main
				mergedPdf.insertPage(0, add_copiedPage_2);//PI12-Att(2)
				mergedPdf.insertPage(0, add_copiedPagef_jspdf2);//PI12-Att_2(2)
				mergedPdf.insertPage(0, add_copiedPagef_jspdf1);//PI12-Att_2(1)
				mergedPdf.insertPage(0, add_copiedPage_3);//PI12-Att(1)
				mergedPdf.insertPage(0, add_copiedPage_4);//PI12-Main
				
	
				this.template.basePdf = await mergedPdf.saveAsBase64({ dataUri: true });
				// //Step2: 調整欄位
				if(this.listContent[4].content.inputForm.length>1){
					this.template.schemas.splice(this.template.schemas.length-1, 0, addTemplate13Att.schemas[0]);
				}
				
				this.template.schemas.splice(0, 0, addTemplate_1.schemas[0]);
				this.template.schemas.splice(0, 0, addTemplate_2.schemas[0]);
				this.template.schemas.splice(0, 0, {});
				this.template.schemas.splice(0, 0, {});
				this.template.schemas.splice(0, 0, addTemplate_3.schemas[0]);
				this.template.schemas.splice(0, 0, addTemplate_4.schemas[0]);
				
				// console.log(this.template);

				

				this.setTemplate();

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					},
				};
				this.viewer = new Viewer({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				// console.log(this.viewer);
			});
		},
		async setTemplate(){
			// console.log(this.inputs.caseReportImg);
		},
		downloadPdf() {
			this.viewer.setInputs([{ "OrderSN": '' }]);
			this.showPdfDialog = false;
			this.handleDownload(`日報表.pdf`);
		},
		handleDownload(filename) {
			generate({ template: this.viewer.getTemplate(), inputs: this.viewer.getInputs(), options: { font: this.viewer.getFont() } }).then(pdf => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const file = new File([blob], filename, { type: 'application/pdf' });
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