<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI2.2</h2>
		<div class="filter-container">
			<el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				@click="handleDownload"
			>輸出PDF</el-button>
		</div>

		<el-row :gutter="24">
			<el-col :span="11">
				<el-card shadow="never" style="width: 450px; margin: 20px auto; padding: 5px 10px;">
					<el-form :model="inputForm">
						<h3>檢核資訊</h3>
							<el-button-group>
								<el-button type="info" icon="el-icon-refresh" size="small" @click="getList()">刷新</el-button>
								<!-- <el-button class="filter-item" type="success" icon="el-icon-document" size="small" @click="storeData">儲存</el-button> -->
							</el-button-group>
						<el-divider />
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
						<h4>每周所有通報數</h4>
						<el-form-item label="被通報案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.informed_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="廠商通報數(查報數)" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyInform_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合理案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.unreasonable_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<!-- <el-divider />
						<el-form-item label="正確判定處理原則案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.correct_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item> -->
						<el-divider />
						<el-form-item label="認定不正確案件或發現錯誤案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.incorrect_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<!-- <el-divider />
						<el-form-item label="廠商自主檢查件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyCheck_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item> -->
						<el-divider />
						
						<h4>應檢附文件</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.checkCorrect_doc22" @change="setPDFinputs">正確判定處理原則(放入觀察區與查報區)之案件資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkIncorrect_doc22" @change="setPDFinputs">認定不正確的案件數資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkSupervisionOrgan_doc22" @change="setPDFinputs">機關或監造抽查檢核後發現錯誤的案件數資訊</el-checkbox>
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="13" ref="container" class="container"/>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { getCaseCount, getPerfContent, setPerfContent } from "@/api/PI";

export default {
	name: "PI2_1",
	components: { },
	data() {
		return {
			labelWidth1:'150px',
			labelWidth2:'20px',
			loading: false,
			initPage: 1,
			listQuery: {
				reportId: 0,
				perfContentId: null
			},
			dateTimePickerVisible: false,
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
			reportDate: '2023-05-31',
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
			pageTurn: [-1, -1],
			template: {},
			inputForm: {
				sumInform_Num22: 0,
				informed_Num22: 0,
				companyInform_Num22: 0,
				unreasonable_Num22: 0,
				correct_Num22: 0,
				incorrect_Num22: 0,
				companyCheck_Num22: 0,
				EFA_22: 0,
				checkCorrect_doc22: true,
				checkIncorrect_doc22: true,
				checkSupervisionOrgan_doc22: true,
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber: '11206250201',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				zipCode: '104',
				district: '中山區',
				requiredStandard_22:'判定道路維護處理(放入觀察區與查報區)必須正確',//要求標準
				measurement_22:'當周正確判定處理原則之案件數/廠商當周通報數',//量測方式
				sumInform_Num22: '0',//A
				informed_Num22: '0',//B
				companyInform_Num22: '0',//C
				unreasonable_Num22: '0',//D
				correct_Num22:'0',//E
				incorrect_Num22: '0',//F
				companyCheck_Num22: '0',
				EFA_22:'',
				checkCorrect_doc22:'V',
				checkIncorrect_doc22:'V',
				checkSupervisionOrgan_doc22:'V',
			},
		};
	},
	computed: {},
	watch: {},
	async created() {	

	},
	mounted() {
		this.initPDF();
	},
	methods: {
		async initPDF() {
			return new Promise(resolve => {
				fetch(`/assets/pdf/weekly/PI2_2-Main.json?t=${Date.now()}`).then(async (response) => {
					const domContainer = this.$refs.container.$el;
					this.template = await response.json();

					const font = {
						edukai: {
							data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
							fallback: true
						}
					};

					const changeInput = (arg) => {
						// console.log(arg);
						if(['checkCorrect_doc22','checkIncorrect_doc22','checkSupervisionOrgan_doc22'].includes(arg.key)) this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v');
						if(['informed_Num22', 'companyInform_Num22', 'unreasonable_Num22', 'correct_Num22', 'incorrect_Num22', 'companyCheck_Num22'].includes(arg.key)) this.inputForm[arg.key] = parseInt(arg.value);
						this.setPDFinputs();
					}

					this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
					this.form.onChangeInput(arg => changeInput(arg));
					for(const [key, value] of Object.entries(this.inputs)) changeInput({ key, value });
					if(Object.keys(this.list.content).length == 0) this.getList();
					else this.setPDFinputs();

					resolve();
				})
			})
		},
		setPDFinputs() {
			//工程名稱
			const reportDate = moment(this.reportDate).subtract(1911, 'year');
			this.inputs.district = this.districtList[this.inputs.zipCode].name;
			this.inputs.contractName = this.districtList[this.inputs.zipCode].tenderName;
			//紀錄編號
			this.inputs.serialNumber = reportDate.format("YYYYMMDD01").slice(1) + String(this.initPage).padStart(2, '0');	
			//檢查日期
			const checkDate = moment(this.checkDate).subtract(1911, 'year');
			this.inputs.date = checkDate.format("YYYY年MM月DD日").slice(1);
			//查核人次數
			for(const key of [ 'informed_Num22', 'companyInform_Num22', 'unreasonable_Num22', 'correct_Num22', 'incorrect_Num22', 'companyCheck_Num22']) this.inputs[key] = String(this.inputForm[key]);
			//廠商自主檢查件數 = 廠商通報數(C)
			this.inputs.companyCheck_Num22 = String(this.inputForm.companyInform_Num22)

			//計算指標數值
			const A = this.inputForm.informed_Num22+this.inputForm.companyInform_Num22;
			const E = this.inputForm.correct_Num22 = this.inputForm.informed_Num22+this.inputForm.companyInform_Num22;
			const F = this.inputForm.incorrect_Num22;
			if(A==0){
				this.inputs.EFA_22=''
			}else{
				this.inputs.EFA_22 = String( Math.round(((E-F)/A)*10000) / 100)
			}

			//計算所有通報數(A) && (E)=(A)
			this.inputs.sumInform_Num22 = String(A);
			this.inputs.correct_Num22 = String(A);
			//應檢附文件
			for(const key of ['checkCorrect_doc22','checkIncorrect_doc22','checkSupervisionOrgan_doc22']){
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}

			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		getList() {
			this.loading = true;
			const date = moment(this.reportDate).format("YYYY-MM-DD");
			this.inputForm.companyInform_Num22 = 0;
			this.inputForm.unreasonable_Num22 = 0;

			getCaseCount({
				zipCode: Number(this.inputs.zipCode),
				timeStart: moment(date).day(1).format("YYYY-MM-DD"),
				timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD")
			}).then(response => {
				this.inputForm.informed_Num22 = Number(response.data.result.caseTotal_inform);
				this.inputForm.companyInform_Num22 = Number(response.data.result.caseTotal_report);
				this.inputForm.unreasonable_Num22 = Number(response.data.result.caseTotal_unreasonable);

				this.setPDFinputs();
				this.loading = false;
			}).catch(err => this.loading = false);
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
				link.download = file.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			});
		},
		// handlePageTurn(type) {
		// 	switch(type) {
		// 		case 0:
		// 			this.$router.push({
		// 				path: "/PIReport/weekly/edit",
		// 				query: { reportId: this.listQuery.reportId }
		// 			})
		// 			return;
		// 		case -1:
		// 			return;
		// 		case 1:
		// 			this.$router.push({
		// 				path: "/PIReport/weekly/PI2_2_Att",
		// 				query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
		// 			})
		// 			return;
		// 	}
		// },
		formatDate(date){
			const momentDate = moment(date);
			return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : "-";
		}
	}
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.el-checkbox
	overflow-wrap: normal
.PI2_1-Att
	position: relative
	.filter-container 
		.filter-item
			margin-right: 5px
</style>