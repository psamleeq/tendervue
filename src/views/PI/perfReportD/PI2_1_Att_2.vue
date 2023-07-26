<template>
	<div class="app-container PI2_1-Att_2">
		<h2>PI-2.1附件-2</h2>
		<el-button-group>
			<el-button icon="el-icon-arrow-left" size="mini" plain :disabled="pageTurn[0] == -1" @click="handlePageTurn(-1)">上一頁</el-button>
			<el-button type="primary" size="mini" plain :disabled="pageTurn[1] == -1"  @click="handlePageTurn(1)">下一頁<i class="el-icon-arrow-right el-icon--right" /></el-button>
		</el-button-group>
		<el-button type="info" size="mini" style="margin-left: 5px" @click="handlePageTurn(0)">返回</el-button>

		<el-row :gutter="24">
			<!-- <div class="filter-container"> -->
			
			<el-col :span="11">
				<el-card shadow="never" style="width: 500px; margin: 40px auto; padding: 5px 10px; ">
					<el-form :model="inputForm" label-width="100px">
						<div style="display:flex;justify-content:space-between;align-items: center">
							<h2>通報資訊</h2>
							<el-button-group>
								<el-button type="info" icon="el-icon-refresh" size="small" @click="getList()">刷新</el-button>
								<el-button class="filter-item" type="success" icon="el-icon-document" size="small" @click="storeData">儲存</el-button>
							</el-button-group>
							<!-- <el-button type="info" @click="handleDownload()" style="margin: 10px" icon="el-icon-document">輸出PDF</el-button> -->
						</div>
						<!-- <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="getList()">預覽</el-button> -->
						<!-- <el-button type="success" @click="storeData" style="margin: 10px" icon="el-icon-document">儲存</el-button> -->
						
						<el-divider />
						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" style="width: 200px" @change="previewPdf()"/>
						</el-form-item>
						<el-form-item label="檢查日期">
							<el-date-picker
								v-model="checkDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 200px"
								@change="previewPdf()"
							/>
						</el-form-item>
						<!-- <el-form-item label="行政區">
							<el-select
								class="filter-item"
								v-model="inputForm.zipCode"
								:disabled="Object.keys(districtList).length <= 1"
								style="width: 200px"
							>
								<el-option
									v-for="(info, zip) in districtList"
									:key="zip"
									:label="info.name"
									:value="Number(zip)"
								/>
							</el-select>
						</el-form-item> -->
						<!-- <el-form-item label="通報日期">
							<time-picker
								class="filter-item"
								:hasWeek="false"
								:timeTabId.sync="timeTabId"
								:dateRange.sync="dateRange"
								style="width: 200px"
							/>
						</el-form-item> -->
						
						<el-form-item label="1999通報" style="width: 400px">
							<el-upload
								list-type="picture"
								action
								accept=".jpg" 
								:multiple="false" 
								:limit="1" 
								:auto-upload="false"
								:on-change="handleChange"
								:on-remove="handleRemove"
								:file-list="inputForm.fileList"
							>
								<el-button type="primary" :disabled="inputForm.fileList.length >= 1">上傳圖片</el-button>
							</el-upload>
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>

			<!-- </div> -->

			<el-col :span="13">
				<div ref="pdfViewer" />
			</el-col>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getCaseList,getPerfContent, setPerfContent } from "@/api/PI";
import TimePicker from '@/components/TimePicker';
import { dateWatcher } from "@/utils/pickerOptions";

export default {
	name: "PI2_1_Att_2",
	components: {TimePicker },
	data() {
		return {
			initPage: 2,
			listQuery: {
				reportId: 0,
				perfContentId: null
			},
			checkDate: moment().startOf("d").subtract(1, "d"),
			reportDate: null,
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
			pdfSetting: {
				format: 'a4',
				fontSize: 14,
				lineHeight: (14 + 2) * 0.35,
				orientation: 'p'
			},
			// list:[],
			listNo1999:[],
			listUnreason:[],
			districtList: {
				// 100: {
				// 	"name": "中正區"
				// },
				103: {
					"name": "大同區",
					"start": "2023/2/1"
				},
				104: {
					"name": "中山區",
					"start": "2022/6/1"
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
			pageTurn: [-1, -1],
			options: {
				DeviceType: {},
			},
			imageWidth:null,
			imageHeight:null,
			inputForm: {
				companyName: '聖東營造股份有限公司',
				formatDate:'',
				dateYear:'',
				zipCode: 104,
				district: '中山區',
				serialNumber1:'',
				serialNumber2:'',
				fileList:[],
			},
			deviceType:{
				1:'AC路面',
				2:'人行道',
				3:'側溝',
			},
			result:{}
		}
	},
	computed: {},
	watch: {
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
	created() {
		if(this.$route.query.contentId) {
			this.listQuery.reportId = this.$route.query.reportId;
			this.listQuery.perfContentId = this.$route.query.contentId;

			const cidList = this.$route.query.cidList.split(",");
			const pageIndex = cidList.indexOf(String(this.$route.query.contentId));
			this.pageTurn = [ 
				Number(pageIndex) == 0 ? -1 : cidList[pageIndex-1], 
				Number(pageIndex) == cidList.length - 1 ? -1 : cidList[pageIndex+1] 
			];
		} else this.$router.push({ path: "/PIIndex/perfReportD/list" });
			
		// 讀入字型
		const readBlob = (blob) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(blob);
			});
		};
		fetch('/assets/font/edukai-4.0.ttf')
			.then(res => res.blob())
			.then(async(blob) => {
				this.viewer = new Viewer({
					domContainer: this.$refs.pdfViewer,
					template: {
						basePdf: BLANK_PDF,
						schemas: [{ }]
					},
					inputs: [{ }],
					options: {
						font:{
							edukai: {
								data: await blob.arrayBuffer(),
								fallback: true
							}
						}
					}
				});
				return readBlob(blob);
			})
			.then(dataUri => dataUri.substr(dataUri.indexOf('base64,') + 7))
			.then(fontBString => {
				// init jsPDF
				this.pdfDoc = new jsPDF();
				this.pdfDoc.addFileToVFS("edukai.ttf", fontBString);
				this.pdfDoc.addFont("edukai.ttf", "edukai", "normal");
				this.pdfDoc.setFont("edukai");

				getPerfContent({
					contentId: this.listQuery.perfContentId
				}).then(async(response) => {
					if (response.data.list.length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
					} else {
						this.list = response.data.list[0];
						this.setData(this.list);
					}
					this.loading = false;
				}).catch(err => { this.loading = false; });
			});
	},
	mounted() { },
	methods: {
		async setData(dataObj) {
			this.list = dataObj;
			if(Object.keys(this.list.content).length != 0) {
				this.inputForm = this.list.content.inputForm
			}
			this.reportDate = this.list.reportDate;
			if(!this.checkDate) this.checkDate = this.list.reportDate;
			this.inputForm.zipCode = this.list.zipCode;

			if(Object.keys(this.list.content).length == 0) await this.getList();
			else await this.previewPdf();
		},
		async getList() {
			new Promise((resolve, reject) => {
				this.loading = true;
				dateWatcher(this.districtList[this.inputForm.zipCode].start, [this.reportDate, this.reportDate]);
				let startDate = moment(this.reportDate).format("YYYY-MM-DD");
				let endDate = moment(this.reportDate).add(1, "day").format("YYYY-MM-DD");

				getCaseList({
					filterType: 2,
					caseType: 2,
					zipCode: this.inputForm.zipCode,
					timeStart: startDate,
					timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
				}).then(async (response) => {
					if (response.data.list.length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
					} else {
						const list = response.data.list;
						this.listNo1999 = list.filter(l => l.DistressSrc !== "1999交辦案件");
						this.listUnreason = list.filter(l => l.State & 16);

						await this.previewPdf()
						resolve();
						
					}
					this.loading = false;
				}).catch(err => { this.loading = false; });
			})
		},
		async handleChange(file, fileList) {
			if(fileList.length > 1) fileList.shift();

			const reader = new FileReader();
			reader.readAsDataURL(file.raw);
			reader.onloadend = (evt) => {
				this.inputForm.fileList = [{
					name: file.name,
					size: file.size,
					type: file.type,
					url: evt.target.result
				}];

				this.previewPdf();
			};
		},
		handleRemove(file, fileList) {
			this.inputForm.fileList = [];

			this.previewPdf();
		},
		headRows() {
			return [
				{ id: '案件編號', name: '通報者', item: '缺失項目', address:'地 點', reason:'原 因' },
			]
		},
		bodyRows(rowCount, data) {
			// console.log(data);
			rowCount = rowCount 
			var body = []
			for (var j = 0; j <= rowCount; j++) {
				if (data[j]) {
					// console.log(data[j]);
					body.push({
						id: data[j].UploadCaseNo,
						name: data[j].DistressSrc,
						item: this.deviceType[data[j].DeviceType],
						address: data[j].CaseName,
						reason: data[j].StateNotes.Firm
					});
				}else {
					body.push({
						id: '',
						name: '',
						item: '',
						address: '',
					});
				}
			}

			return body
		},
		async createPdf() {
			if(this.inputForm.fileList.length != 0){
				// 獲取圖片實際高度寬度
				const image = new Image();
				image.src = this.inputForm.fileList[0].url;
				await image.decode();
				this.imageWidth = image.width;
				this.imageHeight = image.height;
			}
			
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;
				this.pdfDoc.addPage();
				while(this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);

				//第一頁
				this.pdfDoc.setFontSize(15)
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12)
				this.pdfDoc.text(`項目:【PI-2.1附件】`, width-190, height-270, { align: 'left' })
				this.pdfDoc.text(`日報表`, width-40, height-270, { align: 'left' })
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`${this.inputForm.dateYear+"年度"+this.inputForm.district+"道路巡查維護修繕成效式契約"}`,'紀錄編號',`${this.inputForm.serialNumber1+'-1'}`]],
					body: [['施工廠商',`${this.inputForm.companyName}`,'檢查日期',`${this.inputForm.formatDate}`]],
					startY: height-265,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日被通報案件(議員、單一陳情、管區……等)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				let body1 = this.bodyRows(this.listNo1999.length,this.listNo1999)
				this.pdfDoc.autoTable({
					columns: [
						{ dataKey: 'id', header: '案件編號' },
						{ dataKey: 'name', header: '通報者' },
						{ dataKey: 'item', header: '缺失項目' },
						{ dataKey: 'address', header: '地 點' },
					],
					body: body1,
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, halign: 'center'	},
					columnStyles: { id: { cellWidth:30 }, name: { cellWidth:30 }, item: { cellWidth:25 }, address: { cellWidth:'auto',halign:'left' } },
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日被通報案件(1999)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					body: [[{content: '',styles: { minCellHeight: 40 }}]],
					didDrawCell: async (data) => {
						// 添加圖片到PDF中
						if (data.column.index === 0 && data.row.index === 0 && this.inputForm.fileList.length != 0) {
							const cellWidth = data.cell.width;
							const cellHeight = data.cell.height;

							// 等比縮放
							let scale = 1;
							if (this.imageWidth > cellWidth || this.imageHeight > cellHeight) {
								const widthRatio = cellWidth / this.imageWidth;
								const heightRatio = cellHeight / this.imageHeight;
								scale = Math.min(widthRatio, heightRatio);
							}
							const scaledWidth = this.imageWidth * scale;
							const scaledHeight = this.imageHeight * scale;

							// 居中位置
							const x = data.cell.x + (cellWidth - scaledWidth) / 2;
							const y = data.cell.y + (cellHeight - scaledHeight) / 2;

							await this.pdfDoc.addImage(this.inputForm.fileList[0].url, 'JPEG', x, y, scaledWidth, scaledHeight);
						}
						
					},
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, minCellHeight: 20 },
					head: [['廠商:']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})

				// 第二頁
				this.pdfDoc.addPage(this.pdfSetting.format, this.pdfSetting.orientation);
				this.pdfDoc.setFontSize(15)
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12)
				this.pdfDoc.text(`項目:【PI-2.1附件】`, width-190, height-270, { align: 'left' })
				this.pdfDoc.text(`日報表`, width-40, height-270, { align: 'left' })
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`${this.inputForm.dateYear+"年度"+this.inputForm.district+"道路巡查維護修繕成效式契約"}`,'紀錄編號',`${this.inputForm.serialNumber1+'-2'}`]],
					body: [['施工廠商',`${this.inputForm.companyName}`,'檢查日期',`${this.inputForm.formatDate}`]],
					startY: height-265,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日廠商判定不合理案件(1999、議員、單一陳情、管區……等)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				let head2 = this.headRows()
				let body2 = this.bodyRows(this.listUnreason.length,this.listUnreason)
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, halign: 'center'},
					columnStyles: { id: { cellWidth:30 }, name: { cellWidth:30 }, item: { cellWidth:25 }, address: { cellWidth:50, halign:'left' }, reason: { halign:'left' } },
					head: head2,
					body: body2,
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, minCellHeight: 20 },
					head: [['廠商:']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})

				resolve();
			})
		},
		formatFormData(){
			//日期格式
			const checkDate = moment(this.checkDate).subtract(1911, 'year');
			this.inputForm.formatDate = checkDate.format("YYYY年MM月DD日").slice(1);
			
			const reportDate = moment(this.reportDate).subtract(1911, 'year');
			//民國年份
			this.inputForm.dateYear = reportDate.year()
			//紀錄編號
			this.inputForm.serialNumber1 = reportDate.format("YYYYMMDD01").slice(1) + String(this.initPage).padStart(2, '0');
			this.inputForm.serialNumber2 = reportDate.format("YYYYMMDD01").slice(1) + String(this.initPage+1).padStart(2, '0');		
			//行政區
			this.inputForm.district = this.districtList[this.inputForm.zipCode].name		
		},
		async previewPdf() {
			return new Promise((resolve, reject) => {
				this.loading = true;
				this.formatFormData();
				this.createPdf().then(() => {
					const schemas = Array.from({ length: this.pdfDoc.internal.getNumberOfPages() }, () => ({}));

					this.result = this.pdfDoc.output('dataurlstring');
					this.viewer.updateTemplate({ basePdf: this.result, schemas });
					// console.log(this.result);
					resolve();
				})
				this.loading = false;
				
			})
			
		},
		storeData(){
			const storedContent = {
				pageCount: this.pdfDoc.internal.getNumberOfPages(),
				inputForm: this.inputForm,
				// inputs:this.inputs
			}
			setPerfContent(this.listQuery.perfContentId,{
				checkDate: moment(this.checkDate).format("YYYY-MM-DD"),
				content: JSON.stringify(storedContent)
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "提交成功",
						type: "success",
					});
				} 
			}).catch(err => {
				console.log(err);
			})
		},
		async getPDF() {
			return new Promise(resolve =>{
				resolve(this.pdfDoc.output('arraybuffer'));
			});
		},
		handleDownload() {
			this.pdfDoc.save(`PI2.1附件-2.pdf`);
		},
		handlePageTurn(type) {
			switch(type) {
				case 0:
					this.$router.push({
						path: "/PIIndex/perfReportD/edit",
						query: { reportId: this.listQuery.reportId }
					})
					return;
				case -1:
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1_Att",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[0], cidList: this.$route.query.cidList }
					})
					return;
				case 1:
					this.$router.push({
						path: "/PIIndex/perfReportD/PI3_1",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
					})
					return;
			}
		}
	}
}
</script>

<style lang="sass"></style>
