<template>
	<div class="app-container">
		<h2>PI-2.1附件</h2>
		

		<el-row :span="24">
			<!-- <div class="filter-container"> -->
			<el-col :span="10">
				<el-form :model="inputForm" label-width="100px">
						<el-button class="filter-item" type="success" icon="el-icon-plus" @click="getList()">新增</el-button>
						<el-button type="info" @click="downloadPdf()" style="margin: 10px" icon="el-icon-document">輸出PDF</el-button>
						
						<el-divider />
						<el-form-item label="行政區">
							<el-select
								class="filter-item"
								v-model="listQuery.zipCode"
								:disabled="Object.keys(districtList).length <= 1"
								style="width: 300px"
							>
								<el-option
									v-for="(info, zip) in districtList"
									:key="zip"
									:label="info.name"
									:value="Number(zip)"
								/>
							</el-select>
						</el-form-item>
						<el-form-item label="通報日期">
							<time-picker
								class="filter-item"
								:hasWeek="false"
								:timeTabId.sync="timeTabId"
								:dateRange.sync="dateRange"
								style="width: 300px"
							/>
						</el-form-item>
						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" style="width: 300px"/>
						</el-form-item>
						<el-form-item label="施工廠商">
							<el-input v-model="inputForm.companyName" controls-position="right" :min="1" style="width: 300px"/>
						</el-form-item>
						<el-form-item label="檢查日期">
							<el-date-picker
								v-model="searchDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 300px"
							/>
						</el-form-item>
						<el-form-item label="1999通報" style="width: 400px">
							<el-upload
								class="upload-demo"
								action="#"
								:on-change="handleChange"
								:on-remove="handleRemove"
								:auto-upload="false"
								:multiple="false"
								list-type="picture"
							>
								<el-button type="primary" :disabled="imageUrl!=''">上傳圖片</el-button>
							</el-upload>
						</el-form-item>
				</el-form>
			</el-col>

			<!-- </div> -->

			<el-col :span="14">
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
import { generate } from '@pdfme/generator';
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getCaseList } from "@/api/PI";
import TimePicker from '@/components/TimePicker';
import { dateWatcher } from "@/utils/pickerOptions";

export default {
	name: "PI2_1_Att_2",
	components: {TimePicker },
	data() {
		return {
			imageUrl: '',
			initPage:2,
			timeTabId: 1,
			dateRange: [ moment().subtract(1, 'month').startOf("month").toDate(), moment().subtract(1, 'month').endOf("month").toDate() ],
			searchDate: moment().startOf("d").subtract(1, "d"),
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
			list:[],
			listNo1999:[],
			listUnreason:[],
			listQuery: {
				zipCode: 104
			},
			districtList: {
				// 100: {
				// 	"name": "中正區"
				// },
				103: {
					"name": "大同區",
					"tenderName": "112年度大同區道路巡查維護修繕成效式契約",
					"start": "2023/2/1"
				},
				104: {
					"name": "中山區",
					"tenderName": "111年度中山區道路巡查維護修繕成效式契約",
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
			options: {
				DeviceType: {},
			},
			imageWidth:null,
			imageHeight:null,
			inputForm: {
				companyName: '聖東營造股份有限公司',
				formatDate:'',
				dateYear:'',
				district: '中山區',
				serialNumber1:'',
				serialNumber2:''
			},
			deviceType:{
				1:'AC路面',
				2:'人行道',
				3:'側溝',
			}
		}
	},
	computed: {},
	watch: {
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
	created() {},
	mounted() {},
	methods: {
		formatFormData(){
			const date = moment(this.searchDate).subtract(1911, 'year');
			//日期格式
			this.inputForm.formatDate = date.format("YYYY年MM月DD日").slice(1);
			//民國年份
			this.inputForm.dateYear = date.year()
			//紀錄編號
			this.inputForm.serialNumber1 = date.format("YYYYMMDD01").slice(1) + String(this.initPage).padStart(2, '0');
			this.inputForm.serialNumber2 = date.format("YYYYMMDD01").slice(1) + String(this.initPage+1).padStart(2, '0');		
			//行政區
			this.inputForm.district = this.districtList[this.listQuery.zipCode].name		
		},
		getList() {
			this.loading = true;
			dateWatcher(this.districtList[this.listQuery.zipCode].start, this.dateRange);
			let startDate = moment(this.dateRange[0]).format("YYYY-MM-DD");
			let endDate = moment(this.dateRange[1]).format("YYYY-MM-DD");
			this.searchRange = startDate + " - " + endDate;
			this.list = [];

			getCaseList({
				filterType: 2,
				caseType: 2,
				zipCode: this.listQuery.zipCode,
				timeStart: startDate,
				timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.zipCodeNow = this.listQuery.zipCode;
					this.list = response.data.list;
					this.listNo1999 =this.list.filter(l => l.DistressSrc!=="1999交辦案件");
					this.listUnreason = this.list.filter(l => l.State&16);

					// 讀入字型
					const readBlob = (blob) => {
						return new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.readAsDataURL(blob);
						});
					};
					fetch('/assets/font/edukai-4.0.ttf')
					// .then(res => res.arrayBuffer())
					// .then(arrayBuffer => window.btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte))));
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
					}).then(dataUri => dataUri.substr(dataUri.indexOf('base64,') + 7)).then(fontBString => {
						// console.log(fontBString);

						// init jsPDF
						this.pdfDoc = new jsPDF();
						this.pdfDoc.addFileToVFS("edukai.ttf", fontBString);
						this.pdfDoc.addFont("edukai.ttf", "edukai", "normal");
						this.pdfDoc.setFont("edukai");
						this.previewPdf()
					});
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
		handleChange(file, fileList) {
			this.imageUrl = URL.createObjectURL(file.raw);
			// console.log(this.imageUrl);
		},
		handleRemove(file, fileList) {
			this.imageUrl =''
		},
		headRows() {
			return [
				{ id: '案件編號', name: '通報者', item: '缺失項目', address:'地 點', reason:'原 因' },
			]
		},
		bodyRows(rowCount, data) {
			// console.log(data);
			rowCount = rowCount || 10
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
			if(this.imageUrl!=''){
				// 獲取圖片實際高度寬度
				const image = new Image();
				image.src = this.imageUrl;
				await image.decode();
				this.imageWidth = image.width;
				this.imageHeight = image.height;
			}
			
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;

				//第一頁
				this.pdfDoc.setFontSize(15)
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12)
				this.pdfDoc.text(`項目:【PI-2.1附件】`, width-190, height-270, { align: 'left' })
				this.pdfDoc.text(`日報表`, width-40, height-270, { align: 'left' })
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`${this.districtList[this.listQuery.zipCode].tenderName}`,'紀錄編號',`${this.inputForm.serialNumber1+'-1'}`]],
					body: [['施工廠商',`${this.inputForm.companyName}`,'檢查日期',`${this.inputForm.formatDate}`]],
					startY: height-265,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日被通報案件(議員、單一陳情、管區……等)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				let body1 = this.bodyRows(9,this.listNo1999)
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
						if (data.column.index === 0 && data.row.index === 0 && this.imageUrl!='') {
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

							await this.pdfDoc.addImage(this.imageUrl, 'JPEG', x, y, scaledWidth, scaledHeight);
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
					head: [['工程名稱',`${this.districtList[this.listQuery.zipCode].tenderName}`,'紀錄編號',`${this.inputForm.serialNumber1+'-2'}`]],
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
				let body2 = this.bodyRows(9,this.listUnreason)
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

		previewPdf(isInstant = false) {
			this.loading = true;
			this.formatFormData();
			this.createPdf().then(() => {
				const schemas = Array.from({ length: this.pdfDoc.internal.getNumberOfPages() }, () => (
					{
						"OrderSN": {
							"type": "text",
							"position": {
								"x": 10,
								"y": 10
							},
							"width": 27.24,
							"height": 6.12,
							"fontSize": 14,
							"alignment": "center"
						}
					}
				));

				this.viewer.updateTemplate({ basePdf: this.pdfDoc.output('bloburl'), schemas });

				if(isInstant) this.downloadPdf();
				else {
					this.viewer.setInputs([{ "OrderSN": "(預覽列印)" }]);
				}
			})
			this.loading = false;
		},
		downloadPdf() {
			this.viewer.setInputs([{ "OrderSN": '' }]);
			this.handleDownload(`PI2.1附件.pdf`);
		},
		handleDownload(filename) {
			generate({ template: this.viewer.getTemplate(), inputs: this.viewer.getInputs(), options: { font: this.viewer.getFont() } }).then(pdf => {
				console.log(pdf);
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
}
</script>

<style lang="sass"></style>
