<template>
	<div class="app-container PI3_2-Att_2" v-loading="loading">
		<h2>PI3.2附件-2</h2>

		<el-button v-if="pageTurn[0] != -1" icon="el-icon-arrow-left" size="mini" plain :disabled="pageTurn[0] == -1" @click="handlePageTurn(-1)" />
		<el-button type="text" size="mini" style="margin: 0 5px" @click="handlePageTurn()">週報表</el-button>
		<span> > </span>
		<el-button type="text" size="mini" style="margin: 0 5px" @click="handlePageTurn(0)">{{ districtList[inputs.zipCode].name }} ({{ formatDate(reportDate) }})</el-button>
		<el-button v-if="pageTurn[1] != -1" type="primary" icon="el-icon-arrow-right" size="mini" plain :disabled="pageTurn[1] == -1"  @click="handlePageTurn(1)">PI2.2附件</el-button>

		<!-- <div class="filter-container">
			<el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				@click="handleDownload"
			>輸出PDF</el-button>
		</div> -->

		<el-row :gutter="10">
			<el-col :span="12">
				<el-card shadow="never" style="width: 450px; margin: 20px auto; padding: 5px 10px;">
					<el-form :model="inputForm">
						<h3>檢核資訊</h3>
						<el-divider />
						<el-form-item label="起始頁碼" :label-width="labelWidth1">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="檢查日期" :label-width="labelWidth1">
							<el-date-picker
								v-model="checkDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-divider />
						
						<h4>案件資訊</h4>
						<el-form-item label="查報來源" :label-width="labelWidth1">
							<el-select v-model="inputs.distressSrc" placeholder="請選擇" style="width: 130px" @change="changeTemplate">
								<el-option v-for="(value, key) in srcList" :key="key" :label="value.name" :value="key" />
							</el-select>
							<el-checkbox v-model="inputs.inspection" true-label="1" false-label="0" style="margin-left: 10px" @change="changeTemplate">派工</el-checkbox>
						</el-form-item>
						<el-form-item label="案件編號" :label-width="labelWidth1">
							<el-input v-model="inputForm.caseNumber" style="width: 200px" @change="setPDFinputs">
								<el-link slot="append" icon="el-icon-link" :href="`https://road.nco.taipei/RoadMis2/web/ViewDefectAllData.aspx?RDT_ID=${inputForm.caseNumber}`" target="_blank" :underline="false" :disabled="inputForm.caseNumber.length == 0" style="width: 40px; height: 38px;"/>
							</el-input>
						</el-form-item>
						<el-form-item label="損害項目" :label-width="labelWidth1">
							<el-select v-model="inputs.deviceType" placeholder="請選擇" style="width: 80px" @change="changeTemplate">
								<el-option label="AC" value="AC" />
								<el-option label="設施" value="設施" />
							</el-select>
							<el-select v-model="inputs.distressType" placeholder="請選擇" style="width: 120px" @change="changeTemplate">
								<el-option v-for="type in distressType" :key="type" :label="type" :value="type" />
							</el-select>
						</el-form-item>
						<el-form-item label="查報日期" :label-width="labelWidth1">
							<el-date-picker
								v-model="inputForm.checkReportDate"
								type="datetime"
								placeholder="日期"
								format="yyyy-MM-dd HH:mm"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item v-if="['3'].includes(inputs.distressSrc)" label="收件時間" :label-width="labelWidth1">
							<el-date-picker
								v-model="inputForm.receivedDate"
								type="datetime"
								placeholder="日期"
								format="yyyy-MM-dd HH:mm"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item v-if="['3'].includes(inputs.distressSrc)" label="第一階段完成日期" :label-width="labelWidth1">
							<el-date-picker
								v-model="inputForm.actualCompleteS1"
								type="datetime"
								placeholder="日期"
								format="yyyy-MM-dd HH:mm"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item v-if="!(['3'].includes(inputs.distressSrc) && inputs.inspection == '0')" label="預計完工時間" :label-width="labelWidth1">
							<el-date-picker
								v-model="inputForm.expectedCompleteT"
								type="datetime"
								placeholder="日期"
								format="yyyy-MM-dd HH:mm"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item v-if="!(['3'].includes(inputs.distressSrc) && inputs.inspection == '0')" label="實際施工時間" :label-width="labelWidth1">
							<el-date-picker
								v-model="inputForm.actualCompleteT"
								type="datetime"
								placeholder="日期"
								format="yyyy-MM-dd HH:mm"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item label="施工說明" :label-width="labelWidth1">
							<el-select v-model.number="inputForm.completeFixed_Text" placeholder="套用模板" clearable @change="setPDFinputs">
								<el-option v-for="text in finishText" :key="text" :label="text" :value="text" />
							</el-select>
							<el-input
								v-model="inputForm.completeFixed_Text"
								type="textarea"
								:autosize="{ minRows: 2, maxRows: 4}"
								placeholder="請輸入" 
								style="width: 200px"
								@change="setPDFinputs" />
						</el-form-item>
						<el-form-item v-if="['3'].includes(inputs.distressSrc) && inputs.inspection == '1'" label="第一階段回報說明" :label-width="labelWidth1">
							<el-select v-model.number="inputForm.construction_Text" placeholder="套用模板" clearable @change="setPDFinputs">
								<el-option v-for="text in constructionText" :key="text" :label="text" :value="text" />
							</el-select>
							<el-input
								v-model="inputForm.construction_Text"
								type="textarea"
								:autosize="{ minRows: 2, maxRows: 4}"
								placeholder="請輸入" 
								style="width: 200px"
								@change="setPDFinputs" />
						</el-form-item>
						<el-divider />

						<h4>照片</h4>
						<el-form-item label="施工前" :label-width="labelWidth1">
							<el-input v-model="inputForm.preconstruction_Img" style="width: 200px" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="施工後" :label-width="labelWidth1">
							<el-input v-model="inputForm.completeFixed_Img" style="width: 200px" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item v-if="['3'].includes(inputs.distressSrc) && inputs.inspection == '1'" label="第一階段回報" :label-width="labelWidth1">
							<el-input v-model="inputForm.construction_Img" style="width: 200px" @change="setPDFinputs" />
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="12" ref="container" class="container"/>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { getCaseCount, getPerfContent, setPerfContent } from "@/api/PI";

export default {
	name: "PI3_2-Att_2",
	components: { },
	data() {
		return {
			labelWidth1:'150px',
			labelWidth2:'20px',
			loading: false,
			initPage: 6,
			listQuery: {
				reportId: 0,
				perfContentId: null
			},
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
			checkDate: moment().startOf("d").subtract(1, "d"),
			reportDate: null,
			// list:[],
			districtList: {
				// 100: {
				// 	"name": "中正區"
				// },
				103: {
					"name": "大同區",
					"tenderName": "112年度大同區道路巡查維護修繕成效式契約"
				},
				104: {
					"name": "中山區",
					"tenderName": "111年度中山區道路巡查維護修繕成效式契約"
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
			srcList: {
				1: {
					name: '廠商',
					json: { 0: 'PI3_2Att2t1.json', 1: 'PI3_2Att2t1.json' }
				},
				2: {
					name: '隊部',
					json: { 0: 'PI3_2Att2t1.json', 1: 'PI3_2Att2t1.json' }
				},
				3: {
					name: '1999',
					json: { 0: 'PI3_2Att2t2.json', 1: 'PI3_2Att2t3.json' }
				}
			},
			distressType: ['坑洞', '人孔高差', '縱橫向裂縫/龜裂', '車轍/隆起與凹陷', '人行道'],
			finishText: [
				'\n已修復完工(無須復標)',
				'\n已修復完工(已復標)',
				'\n本案分隊工班修復完妥',
				'\n已請管區開立{{單位}}B單',
				'\n本案{{單位}}已派員改善完妥'
			],
			constructionText: [
				'\n佐證第一階段已交維處理之照片',
				'\n佐證第一階段已臨補處理之照片',
				'第一階段無處理之原因：\n'
			],
			pageTurn: [-1, -1],
			template: {},
			inputForm: {
				caseNumber: '',
				checkReportDate: '',
				expectedCompleteT: '',
				actualCompleteT: '',
				receivedDate: '',
				actualCompleteS1: '',
				completeFixed_Text: '',
				construction_Text: '',
				preconstruction_Img: '',
				completeFixed_Img: '',
				construction_Img: '',
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber: '11206250201',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				deviceType: '',
				distressType: '',
				distressSrc: '1',
				inspection: '1',
				zipCode: '104',
				distressSrc_Text: '',
				caseNumber: '',
				completeFixed_Text: '',
				construction_Text: '',
				checkReportDate: '',
				expectedCompleteT: '',
				actualCompleteT: '',
				receivedDate: '',
				actualCompleteS1: '',
				checkReportData_Img: '', 
				dispatchData_Img: '',
				completeReportData_Img: '',
				reportData1999_Img: '',
				preconstruction_Img: '',
				completeFixed_Img: '',
				construction_Img: ''
			},
		};
	},
	computed: { },
	watch: {},
	async created() {	
		this.schemasOri = {};

		// if(this.$route.query.reportId && this.$route.query.contentId) {
			// this.listQuery.reportId = this.$route.query.reportId;
			// this.listQuery.perfContentId = this.$route.query.contentId;

			// const cidList = this.$route.query.cidList.split(",");
			// const pageIndex = cidList.indexOf(String(this.$route.query.contentId));
			// this.pageTurn = [ 
			// 	Number(pageIndex) == 0 ? -1 : cidList[pageIndex-1], 
			// 	Number(pageIndex) == cidList.length - 1 ? -1 : cidList[pageIndex+1] 
			// ];

			// getPerfContent({
			// 	contentId: this.listQuery.perfContentId
			// }).then((response) => {
			// 	if (response.data.list.length == 0) {
			// 		this.$message({
			// 			message: "查無資料",
			// 			type: "error",
			// 		});
			// 	} else {
			// 		this.list = response.data.list[0];
					this.setData(this.list || { zipCode: 104, reportDate: '2023-05-31', content: {} });
			// 	}

			// 	this.loading = false;
			// }).catch(err => { this.loading = false; });
		// } else this.$router.push({ path: "/PIReport/weekly/list" });	
	},
	mounted() {},
	methods: {
		async setData(dataObj) {
			this.list = dataObj;
			if(Object.keys(this.list.content).length != 0) {
				this.inputs = this.list.content.inputs;
				this.initPage = this.list.content.initPage;
			}
			this.reportDate = this.list.reportDate;
			this.checkDate = this.list.checkDate ? this.list.checkDate : this.list.reportDate;
			this.inputs.zipCode = String(this.list.zipCode);

			await this.initPDF();
		},
		async initPDF() {
			return new Promise(resolve => {
				fetch(`/assets/pdf/weekly/PI3_2Att2t1.json?t=${Date.now()}`).then(async (response) => {
					const domContainer = this.$refs.container.$el;
					this.template = await response.json();

					const font = {
						edukai: {
							data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
							fallback: true
						}
					};

					const changeInput = (arg) => {
						if(['caseNumber', 'completeFixed_Text', 'construction_Text'].includes(arg.key)) this.inputForm[arg.key] = arg.value;
						if(['checkReportDate', 'receivedDate', 'actualCompleteS1', 'expectedCompleteT', 'actualCompleteT', ].includes(arg.key)) {
							const dateTime = moment(arg.value);
							this.inputForm[arg.key] = dateTime.isValid() 
							? dateTime.add(1911, 'year').format("YYYY/MM/DD HH:mm:ss")
							: '';
						}

						if(['checkReportData_Img', 'dispatchData_Img', 'completeReportData_Img', 'reportData1999_Img',  'preconstruction_Img', 'completeFixed_Img', 'construction_Img'].includes(arg.key)) {
							this.inputs[arg.key] = arg.value;
							if(this.inputForm[arg.key] != undefined && arg.value.length == 0) this.inputForm[arg.key] = arg.value;
							this.aspectRatioImg(arg);
						}
					}

					this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
					this.form.onChangeInput(arg => changeInput(arg));

					for(const [key, value] of Object.entries(this.inputs)) changeInput({ key, value });
					this.setPDFinputs();
						
					resolve();
				})
			})
		},
		changeTemplate() {
			// this.loading = true;
			if([1, 2].includes(this.inputs.distressSrc)) this.inputs.inspection = '1';
			const fileName = this.srcList[this.inputs.distressSrc].json[this.inputs.inspection];
			// console.log(fileName);
			fetch(`/assets/pdf/weekly/${fileName}?t=${Date.now()}`).then(async (response) => {
				this.template = await response.json();
				this.form.updateTemplate(this.template);
				this.setPDFinputs();
				this.loading = false;
			})
		},
		aspectRatioImg(arg) {
			const keyArray = this.template.schemas.map(item => Object.keys(item));
			const keyIndex =  keyArray.findIndex(el => el.includes(arg.key));
			// console.log(arg.key, keyIndex);
			if(this.schemasOri[arg.key]) {
				this.template.schemas[keyIndex][arg.key] = JSON.parse(JSON.stringify(this.schemasOri[arg.key]));
				delete this.schemasOri[arg.key];
				this.form.updateTemplate(this.template);
			}

			const img = new Image();
			img.onload = () => {
				// console.log(img.width, img.height);
				const templateWidth = this.template.schemas[keyIndex][arg.key].width;
				const templateHeight = this.template.schemas[keyIndex][arg.key].height;
				const ratio = Math.min(templateWidth / img.width, templateHeight / img.height);
				// console.log(ratio);

				this.schemasOri[arg.key] = JSON.parse(JSON.stringify(this.template.schemas[keyIndex][arg.key]));
				this.template.schemas[keyIndex][arg.key].position.x = this.template.schemas[keyIndex][arg.key].position.x + (this.template.schemas[keyIndex][arg.key].width - img.width * ratio) / 2;
				this.template.schemas[keyIndex][arg.key].position.y = this.template.schemas[keyIndex][arg.key].position.y + (this.template.schemas[keyIndex][arg.key].height - img.height * ratio) / 2;
				this.template.schemas[keyIndex][arg.key].width = img.width * ratio;
				this.template.schemas[keyIndex][arg.key].height = img.height * ratio;
				this.form.updateTemplate(this.template);
			}
			img.src = arg.value;
		},
		setPDFinputs() {
			// console.log('setPDFinputs');
			//工程名稱
			const reportDate = moment(this.reportDate).subtract(1911, 'year');
			this.inputs.contractName = this.districtList[this.inputs.zipCode].tenderName;
			//紀錄編號
			this.inputs.serialNumber = reportDate.format("YYYYMMDD02").slice(1) + String(this.initPage).padStart(2, '0');	
			//檢查日期
			const checkDate = moment(this.checkDate).subtract(1911, 'year');
			this.inputs.date = checkDate.format("YYYY年MM月DD日").slice(1);
			//查報來源
			this.inputs.distressSrc_Text = (this.inputs.distressSrc == '1') ? '自主' : (this.inputs.distressSrc == '2') ? '隊部' : '';

			for(const key of ['caseNumber', 'completeFixed_Text', 'construction_Text']) {
				this.inputs[key] = String(this.inputForm[key]);
			}

			for(const key of ['checkReportDate',  'receivedDate', 'actualCompleteS1', 'expectedCompleteT', 'actualCompleteT']) {
				const dateTime = moment(this.inputForm[key]);
				this.inputs[key] = dateTime.isValid() 
					? dateTime.subtract(1911, 'year').format("YYYY/MM/DD HH:mm").slice(1)
					: '';
			}

			for(const key of ['checkReportData_Img', 'dispatchData_Img', 'completeReportData_Img', 'reportData1999_Img',  'preconstruction_Img', 'completeFixed_Img', 'construction_Img']) {
				if(this.inputForm[key] != undefined) {
					this.inputs[key] = this.inputForm[key];
					this.aspectRatioImg({ key, value: this.inputs[key] });
				}
			}

			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		storeData(){
			this.loading = true;
			const storedContent = {
				pageCount: 1,
				initPage: this.initPage,
				inputs: this.inputs
			}
			setPerfContent(this.listQuery.perfContentId, {
				checkDate: moment(this.checkDate).format("YYYY-MM-DD"),
				content: JSON.stringify(storedContent)
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
				generate({ template: this.form.getTemplate(), inputs: this.form.getInputs(), options: { font: this.form.getFont() } }).then((pdf) => {
					resolve(pdf);
				});
			});
		},
		handleDownload() {
			// console.log(this.form);
			generate({ template: this.form.getTemplate(), inputs: this.form.getInputs(), options: { font: this.form.getFont() } }).then((pdf) => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const filename = "成效式契約指標檢核表PI-2-2.pdf"; 
				const file = new File([blob], filename, { type: 'application/pdf' });
				const link = document.createElement('a');
				const url = URL.createObjectURL(file);
				link.href = url;
				console.log(link,url);
				link.download = file.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			});
		},
		handlePageTurn(type) {
			switch(type) {
				case 0:
					this.$router.push({
						path: "/PIReport/weekly/edit",
						query: { reportId: this.listQuery.reportId }
					})
					return;
				case -1:
					return;
				case 1:
					this.$router.push({
						path: "/PIReport/weekly/PI2_2_Att",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
					})
					return;
			}
		},
		formatDate(date){
			const momentDate = moment(date);
			return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : "-";
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.PI3_2-Att_2
	.el-input-group__append
		padding: 0
</style>