<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI2.1</h2>
		<!-- <div class="filter-container">
			<el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				@click="handleDownload"
			>輸出PDF</el-button>
		</div> -->
		
		<el-row :gutter="24">
			<el-col :span="11">
				<el-card shadow="never" style="width: 480px; margin: 20px auto; padding: 5px 10px;">
					<el-form :model="inputForm">
						<div style="display:flex;justify-content:space-between;align-items: center">
							<h2>檢核資訊</h2>
							<el-button
								class="filter-item"
								type="success"
								icon="el-icon-document"
								@click="storeData"
								style="height:40px"
							>儲存</el-button>
						</div>
						
						<el-divider />
						<!-- <el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item> -->
						<el-form-item label="檢查日期" :label-width="labelWidth1">
							<el-date-picker
								v-model="searchDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item label="行政區" :label-width="labelWidth1">
							<el-select class="filter-item" v-model="inputs.zipCode" :disabled="Object.keys(districtList).length <= 1" @change="setPDFinputs()" style="width: 200px">
								<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="zip" />
							</el-select>
						</el-form-item>
						<el-divider />
						<h4>所有通報數</h4>
						<el-form-item label="被通報案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.informed_Num21" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="廠商通報數(查報數)" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyInform_Num21" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合理案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.unreasonable_Num21" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="未登入或登入不完整案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.incomplete_Num21" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<!-- <el-divider />
						<h4>監造自主檢查件數</h4>
						<el-form-item label="合格件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.supervisionCheckPass_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合格件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.supervisionCheckFail_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<h4>機關自主檢查件數</h4>
						<el-form-item label="合格件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.organCheckPass_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合格件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.organCheckFail_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="未登入或登入不完整案件總數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.totalIncomplete_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item> -->
						<el-divider />
						<h4>應檢附文件</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.checkCo_dailyInform21" @change="setPDFinputs">廠商每天通報資訊(巡查日誌)</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCo_dailyLogin21" @change="setPDFinputs">廠商於系統每天登錄資料數量資訊(道管系統案件處理+觀察案件)</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkPeriod_Complete21" @change="setPDFinputs">期間有完成巡查工作但未登錄之資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkPeriod_IncompleteLogin21" @change="setPDFinputs">期間系統資料登錄不完整案件資訊</el-checkbox>
						</el-form-item>
						<!-- <el-divider />
						<h4>是否合格</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.pass" @change="setPDFinputs">是</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.fail" @change="setPDFinputs">否，原因:(請填寫原因)</el-checkbox>
							<br/>
							<el-input type="text" v-model="inputForm.failReason" @change="setPDFinputs" size="small" style="width:300px">
								<template slot="prepend">原因</template>
							</el-input>
						</el-form-item> -->
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
import { getPerfContent, setPerfContent } from "@/api/PI";

export default {
	name: "PI2_1",
	components: { },
	data() {
		return {
			labelWidth1:'150px',
			labelWidth2:'20px',
			loading: false,
			timeTabId: 1,
			initPage: 1,
			dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
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
			searchDate: moment().startOf("d").subtract(1, "d"),
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
			template: {},
			inputForm: {
				// sumInform_Num21:0,
				informed_Num21: 0,
				companyInform_Num21: 0,
				unreasonable_Num21: 0,
				// roadSystem_Num21:0,
				incomplete_Num21: 0,
				// companyCheck_Num21: 0,
				// EFA_21:0,
				checkCo_dailyInform21:true,
				checkCo_dailyLogin21:true,
				checkPeriod_Complete21:true,
				checkPeriod_IncompleteLogin21:true,
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber_21Main: '1111102101',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				zipCode: '104',
				district: '中山區',
				requiredStandard_21:'完成巡查工作後必須及時登錄資料',//要求標準
				measurement_21:'廠商於系統當天登錄資料數量/廠商當天通報數',//量測方式
				sumInform_Num21: '0',//A
				informed_Num21: '0',//B
				companyInform_Num21: '0',//C
				unreasonable_Num21: '0',//D
				roadSystem_Num21:'0',//E
				incomplete_Num21: '0',//F
				companyCheck_Num21: '0',
				EFA_21:'',
				checkCo_dailyInform21:'',
				checkCo_dailyLogin21:'',
				checkPeriod_Complete21:'',
				checkPeriod_IncompleteLogin21:'',
			},
			perfContentId:null,
			list:[],
		};
	},
	computed: { },
	watch: {},
	async created() {	
		// this.template = {};
		// this.form = {};
	},
	mounted() {
		this.perfContentId = this.$route.query.row.id
		// console.log(this.perfContentId);

		getPerfContent({
			contentId: this.perfContentId
		}).then((response) => {
			if (response.data.list.length == 0) {
				this.$message({
					message: "查無資料",
					type: "error",
				});
			} else {
				this.list = response.data.list;
				if(this.list[0].content.length!=0){
					this.inputs = this.list[0].content.inputs
					this.inputForm = this.list[0].content.inputForm
					this.searchDate = this.list[0].checkDate
				}
				this.initPDF();
			}
			this.loading = false;
		}).catch(err => { this.loading = false; });
		
		
	},
	methods: {
		initPDF() {
			fetch(`/assets/pdf/PI2_1-Main.json?t=${Date.now()}`).then(async (response) => {
				
				const domContainer = this.$refs.container.$el;
				this.template = await response.json();

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					}
				};

				this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				this.form.onChangeInput(arg => {
					// console.log(arg);
					if(['checkCo_dailyInform21','checkCo_dailyLogin21','checkPeriod_Complete21','checkPeriod_IncompleteLogin21'].includes(arg.key)){
						this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v')
					}
					if([
						'informed_Num21',
						'companyInform_Num21',
						'unreasonable_Num21',
						'incomplete_Num21',
						'companyCheck_Num21'].includes(arg.key)) {
						this.inputForm[arg.key] = parseInt(arg.value)
					}
					if(['failReason'].includes(arg.key)){
						this.inputForm[arg.key] = arg.value
					}
					this.setPDFinputs();
				});
				this.setPDFinputs();
			})
		},
		setPDFinputs() {
			//檢查日期
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			//工程名稱
			this.inputs.district = this.districtList[this.inputs.zipCode].name;
			this.inputs.contractName = date.year()+"年度"+this.inputs.district+"道路巡查維護修繕成效式契約";
			//紀錄編號
			this.inputs.serialNumber_21Main = date.format("YYYYMMDD01").slice(1) + String(this.initPage).padStart(2, '0');			
			//查核人次數(資料轉換)
			for(const key of [
				'informed_Num21',
				'companyInform_Num21',
				'unreasonable_Num21',
				'incomplete_Num21']) {
				this.inputs[key] = String(this.inputForm[key]);
			}
			//廠商自主檢查件數 = 廠商通報數(C)
			 this.inputs.companyCheck_Num21 = String(this.inputForm.companyInform_Num21)
			
			//計算指標數值(A=E)
			const A = this.inputForm.informed_Num21+this.inputForm.companyInform_Num21;
			const E = this.inputForm.roadSystem_Num21 = this.inputForm.informed_Num21+this.inputForm.companyInform_Num21
			const F = this.inputForm.incomplete_Num21;
			// const G = this.inputForm.supervisionCheckFail_Num;
			// const H = this.inputForm.organCheckFail_Num;
			if(A==0){
				this.inputs.EFA_21=''
			}else{
				this.inputs.EFA_21=String(((E-F)/A)*100)
			}
			//計算所有通報數(A) && (E)=(A)xw
			this.inputs.sumInform_Num21 = String(A);
			this.inputs.roadSystem_Num21 = String(A);
			//應檢附文件
			for(const key of ['checkCo_dailyInform21','checkCo_dailyLogin21','checkPeriod_Complete21','checkPeriod_IncompleteLogin21']){
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}

			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		storeData(){
			const storedContent = {
				pageCount:1,
				inputForm:this.inputForm,
				inputs:this.inputs
			}
			setPerfContent(this.perfContentId,{
				checkDate: moment(this.searchDate).format("YYYY-MM-DD"),
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
		
	},
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
	// .container
	// 	position: fixed
	// 	top:30px
	// 	right:0
</style>