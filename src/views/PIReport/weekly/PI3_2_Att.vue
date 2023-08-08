<template>
	<div class="app-container PI3_2-Att" v-loading="loading">
		<h2>PI3.2附件</h2>

		<el-button v-if="pageTurn[0] != -1" icon="el-icon-arrow-left" size="mini" plain :disabled="pageTurn[0] == -1" @click="handlePageTurn(-1)">PI2.1附件</el-button>
		<el-button type="text" size="mini" style="margin: 0 5px" @click="handlePageTurn()">週報表</el-button>
		<span> > </span>
		<el-button type="text" size="mini" style="margin: 0 5px" @click="handlePageTurn(0)">{{ districtList[inputs.zipCode].name }} ({{ formatDate(reportDate) }})</el-button>
		<el-button v-if="pageTurn[1] != -1" type="primary" icon="el-icon-arrow-right" size="mini" plain :disabled="pageTurn[1] == -1"  @click="handlePageTurn(1)">PI2.2附件-3</el-button>

		<el-row :gutter="24">
			<el-col :span="12">
				<el-card shadow="never" style="width: 550px; margin: 40px auto; padding: 5px 10px; ">
					<el-form :model="inputs" label-width="100px">
						<div style="display: flex; justify-content: space-between; align-items: center">
							<h3>通報資訊</h3>

							<span>
								<el-upload :class="[ 'filter-item', 'upload-csv', { 'is-ready' : csvFileList.length > 0 }]" ref="uploadFile" action accept=".csv" :multiple="false" :limit="1" :auto-upload="false" :file-list="csvFileList" :on-change="readCSV" :on-remove="handleRemove">
									<el-button type="info" size="small" plain>上傳CSV</el-button>
								</el-upload>
									
								<el-button class="filter-item" type="success" icon="el-icon-document" size="small" @click="storeData">儲存</el-button>
								<!-- <el-button type="info" @click="handleDownload()" style="margin: 10px" icon="el-icon-document">輸出PDF</el-button> -->
							</span>
						</div>
						
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
					</el-form>
				</el-card>
			</el-col>

			<el-col :span="12">
				<div ref="pdfViewer" />
			</el-col>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import jschardet from "jschardet";
import iconv from "iconv-lite";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getPerfContent, setPerfContent } from "@/api/PI";
import TimePicker from '@/components/TimePicker';

export default {
	name: "PI3_2_Att",
	components: { TimePicker },
	data() {
		return {
			loading: false,
			initPage: 5,
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
			headers: {
				CaseNo: "案件編號",
				DistressSrc: "查報來源",
				CaseDate: "查報日期",
				Place: "查報地點",
				DateDeadline: "預計完工日期",
				DateCompleted: "實際完工時間"
			},
			csvFileList: [],
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
			pageTurn: [-1, -1],
			options: {
				DeviceType: {},
			},
			imageWidth:null,
			imageHeight:null,
			// rowActive: {},
			newItem: {
				reportDate: "",
				distressSrc: "",
				AC_total: 0,
				AC_unreasonable: 0,
				facility_total: 0,
				facility_unreasonable: 0
			},
			imgList: [],
			inputs: {
				companyName: '聖東營造股份有限公司',
				formatDate:'',
				dateYear:'',
				zipCode: 104,
				district: '中山區',
				serialNumber: '',
				csvData: []
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
	watch: { },
	created() {
		this.rowActive = {};
		// if(this.$route.query.contentId) {
		// 	this.listQuery.reportId = this.$route.query.reportId;
		// 	this.listQuery.perfContentId = this.$route.query.contentId;

		// 	const cidList = this.$route.query.cidList.split(",");
		// 	const pageIndex = cidList.indexOf(String(this.$route.query.contentId));
		// 	this.pageTurn = [ 
		// 		Number(pageIndex) == 0 ? -1 : cidList[pageIndex-1], 
		// 		Number(pageIndex) == cidList.length - 1 ? -1 : cidList[pageIndex+1] 
		// 	];

		// 	getPerfContent({
		// 			contentId: this.listQuery.perfContentId
		// 		}).then(async(response) => {
		// 			if (response.data.list.length == 0) {
		// 				this.$message({
		// 					message: "查無資料",
		// 					type: "error",
		// 				});
		// 			} else {
		// 				this.list = response.data.list[0];
						this.setData(this.list || { zipCode: 104, reportDate: '2023-05-14', content: {} });
		// 			}
		// 			this.loading = false;
		// 		}).catch(err => { this.loading = false; });

		// } else this.$router.push({ path: "/PIReport/daily/list" });
	},
	mounted() { },
	methods: {
		async setData(dataObj) {
			this.list = dataObj;
			this.reportDate = this.list.reportDate;
			this.newItem.reportDate = moment(this.reportDate).format('MM/DD');
			this.checkDate = this.list.checkDate ? this.list.checkDate : this.list.reportDate;
			this.inputs.zipCode = this.list.zipCode;

			if(Object.keys(this.list.content).length != 0) {
				this.inputs = this.list.content.inputs;
				this.initPage = this.list.content.initPage;
			}

			await this.initPDF();
			await this.previewPdf();
		},
		async initPDF() {
			return new Promise(resolve => {
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

						resolve();
					});
			})
		},
		readCSV(file, fileList) {
			if(fileList.length > 1) fileList.shift();
			this.csvFileList = JSON.parse(JSON.stringify(fileList));
			this.tableSelect = [];

			if(file.raw.type != "text/csv") {
				this.$message({
					type: "warning",
					message: "文件類型不符，請重新上傳正確csv"
				});
				this.handleRemove(); 
			} else {
				this.loading = true;
				let reader = new FileReader();
				// reader.readAsText(file.raw, "UTF-8");
				reader.readAsArrayBuffer(file.raw);
				reader.onload = (evt) => {
					// 讀取CSV內容
					// const fileString = evt.target.result;
					const buffer = Buffer.from(evt.target.result);
					const type = jschardet.detect(buffer);
					// console.log(type);
					const fileString = iconv.decode(buffer, type.encoding);

					//轉成array
					this.inputs.csvData = this.csvToArray(fileString);
					// console.log(this.inputs.csvData);
					this.checkCsv();
				}
			}
		},
		checkCsv() {
			const fileHeaders = Object.keys(this.inputs.csvData[0]);
			let lackHeaderList = [];
			for(const header of Object.values(this.headers)) {
				if(!fileHeaders.includes(header)) lackHeaderList.push(header);
			}

			if(lackHeaderList.length != 0) {
				this.$message({
					type: "warning",
					message: `csv缺少欄位${lackHeaderList.map(l => `「${l}」`).join("、")}，請重新上傳正確csv`
				});
				this.handleRemove(); 
			} else {
				this.inputs.csvData.forEach(data => {
					Object.keys(data).forEach(oldKey => {
						const newKeyArr = Object.keys(this.headers).filter(key => this.headers[key] == oldKey);
						if(newKeyArr.length != 0) data[newKeyArr[0]] = data[oldKey];
						delete data[oldKey];
					});
				});

				this.inputs.csvData.sort((a,b) => a.CaseNo - b.CaseNo);
				this.previewPdf();
			}
		},
		csvToArray(str, delimiter = ",") {
			str = str.replace(/\"(.*)[\r\n|\n](.*)\"/g, "$1$2");
			const headers = str.slice(0, str.indexOf("\n")).split(delimiter).map(header => header.replace(/\r\n/g,'').trim());
			const rows = str.slice(str.indexOf("\n") + 1).split("\n").filter(row => row.length != 0);
			const regex = /("[^"]+"|[^,]+)*,/g;

			const result = rows.map(row => {
				const values = row.split(regex).filter(row => row == undefined || row.length != 0).map(row => {
					if(row == undefined) return row = '';
					else return row.replace(/\r\n|\"/g,'').trim();
				});

				return headers.reduce((object, header, index) => {
					object[header] = values[index]; 
					return object
				}, {});
			});	

			return result
		},
		handleRemove(file, fileList) {
			this.inputs.csvData = [];
			if(fileList == undefined) this.csvFileList = [];
			else this.csvFileList = JSON.parse(JSON.stringify(fileList));
			this.$refs.uploadFile.clearFiles();
			this.previewPdf();
			this.loading = false;
		},
		async createPdf_header(pageIndex) {
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;

				this.pdfDoc.setFontSize(15);
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12);
				this.pdfDoc.text(`項目:【PI-3.2附件】`, width-190, height-270, { align: 'left' });
				this.pdfDoc.text(`週報表`, width-40, height-270, { align: 'left' });

				const serialNumber = `${this.inputs.serialNumber}` + (pageIndex == 0 ? "" : `-${pageIndex}`);
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`${this.districtList[this.inputs.zipCode].tenderName}`,'紀錄編號',`${serialNumber}`]],
					body: [['施工廠商',`${this.inputs.companyName}`,'檢查日期',`${this.inputs.formatDate}`]],
					startY: height-265,
				})

				resolve();
			})
		},
		async createPdf_footer() {
			return new Promise((resolve, reject) => {
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, minCellHeight: 20, valign: 'middle' },
					head: [['廠商:']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				resolve();
			})
		},
		async createPdf() {
			return new Promise(async (resolve, reject) => {
				const total = this.inputs.csvData.length;
				const splitTable = this.inputs.csvData.reduce((acc, cur) => {
					if(acc[acc.length-1].length <= 20) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header(pageIndex);

					this.pdfDoc.autoTable({
						theme: 'plain',
						styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
						head: [[`本週預計完工案件列表: ${total} 件`]],
						startY: this.pdfDoc.lastAutoTable.finalY,
					})
					this.pdfDoc.autoTable({
						columns: [
							{ dataKey: 'CaseNo', header: '案件編號' },
							{ dataKey: 'CaseDate', header: '查報日期' },
							{ dataKey: 'DistressSrc', header: '查報來源' },
							{ dataKey: 'Place', header: '查報地點' },
							{ dataKey: 'DateDeadline', header: '預計完工日期' },
							{ dataKey: 'DateCompleted', header: '實際完工日期' }
						],
						body: table.length == 0 ? [ { CaseNo: '' } ] : table,
						theme: 'plain',
						styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10, halign: 'center', valign: 'middle', cellPadding: 1	},
						headStyles: { fontSize: 9, textColor: 90, fillColor: 240 },
						columnStyles: { 
							CaseNo: { cellWidth: 20 }, 
							CaseDate: { cellWidth: 18 }, 
							DistressSrc: { cellWidth: 19 }, 
							Place: { cellWidth: 'auto', halign: 'left' }, 
							DateDeadline: { cellWidth: 22 }, 
							DateCompleted: { cellWidth: 22 } 
						},
						startY: this.pdfDoc.lastAutoTable.finalY,
					})

					await this.createPdf_footer();
				}
				resolve();
			})
		},
		formatFormData(){
			//日期格式
			const checkDate = moment(this.checkDate).subtract(1911, 'year');
			this.inputs.formatDate = checkDate.format("YYYY年MM月DD日").slice(1);
			
			const reportDate = moment(this.reportDate).subtract(1911, 'year');
			//民國年份
			this.inputs.dateYear = reportDate.year()
			//紀錄編號
			this.inputs.serialNumber = reportDate.format("YYYYMMDD02").slice(1) + String(this.initPage).padStart(2, '0');	
			//行政區
			this.inputs.district = this.districtList[this.inputs.zipCode].name		
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
			this.loading = true;
			let imgObj = {}; 
			let inputs = JSON.parse(JSON.stringify(this.inputs));

			Object.keys(this.inputs).forEach(key => {
				if(key.includes('Img')) {
					imgObj[key] = this.inputs[key];
					inputs[key] = "";
				}
			})


			const storedContent = {
				pageCount: this.pdfDoc.internal.getNumberOfPages(),
				initPage: this.initPage,
				inputs
			}
			// console.log(storedContent, imgObj);

			setPerfContent(this.listQuery.perfContentId,{
				checkDate: moment(this.checkDate).format("YYYY-MM-DD"),
				content: JSON.stringify(storedContent),
				imgObj
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "提交成功",
						type: "success",
					});
				} 
				this.loading = false;
			}).catch(err => {
				console.log(err);
				this.loading = false;
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
						path: "/PIReport/daily/edit",
						query: { reportId: this.listQuery.reportId }
					})
					break;
				case -1:
					this.$router.push({
						path: "/PIReport/daily/PI2_1_Att",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[0], cidList: this.$route.query.cidList }
					})
					break;
				case 1:
					this.$router.push({
						path: "/PIReport/daily/PI3_1",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
					})
					break;
				default:
					const date = moment(this.reportDate).format("YYYY-MM-DD");
					this.$router.push({
						path: "/PIReport/daily/list",
						query: { zipCode: this.inputs.zipCode, timeStart: date, timeEnd: date }
					})
					break;
			}
		},
		formatDate(date){
			const momentDate = moment(date);
			return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : "-";
		}
	}
}
</script>

<style lang="sass">
.PI3_2-Att
	.upload-csv
		display: inline-flex
		// flex-direction: row-reverse
		border: 1px solid rgba(#909399, 0.6)
		border-radius: 5px
		&.is-ready > .el-upload.el-upload--text
			display: none
		.el-upload-list__item
			transition: none !important
			margin-top: 0
			.el-upload-list__item-name
				line-height: 35px
				margin: 0 25px 0 10px
			.el-icon-close
				display: block
				top: 50%
				transform: translateY(-50%)
				color: #F56C6C
				font-weight: bold
				&:hover
					color: white
					background-color: #F56C6C
					border-radius: 50%
</style>
