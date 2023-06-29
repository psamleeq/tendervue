<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI2.1</h2>
		<div class="filter-container">
			<el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				@click="handleDownload"
			>輸出PDF</el-button>
			<!-- <el-button class="filter-item" type="info" @click="setPDFinputs">更新內容</el-button> -->
		</div>

		<el-row :gutter="24">
			<el-col :span="13">
				<el-card shadow="never" style="width: 480px; margin: 20px auto; padding: 5px 10px;">
					<el-form :model="inputForm">
						<h2>檢核資訊</h2>
						<el-divider />
						<!-- <el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" :max="1" @change="setPDFinputs" />
						</el-form-item>
						<el-divider /> -->
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
						<el-divider />
						<!-- <el-form-item label="行政區">
							<el-select class="filter-item" v-model="inputs.zipCode" :disabled="Object.keys(districtList).length <= 1" @change="getList()">
								<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="zip" />
							</el-select>
						</el-form-item> -->
						<h4>所有通報數</h4>
						<el-form-item label="被通報案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.informed_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="廠商通報數(查報數)" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyInform_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合理案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.unreasonable_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="道路系統登入件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.roadSystem_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="未登入或登入不完整案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.incomplete_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="廠商自主檢查件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyCheck_Num" controls-position="right" :min="0" @change="setPDFinputs" />
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
							<el-checkbox v-model="inputForm.checkCo_dailyInform" @change="setPDFinputs">廠商每天通報資訊(巡查日誌)</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCo_dailyLogin" @change="setPDFinputs">廠商於系統每天登錄資料數量資訊(道管系統案件處理+觀察案件)</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkPeriod_Complete" @change="setPDFinputs">期間有完成巡查工作但未登錄之資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkPeriod_IncompleteLogin" @change="setPDFinputs">期間系統資料登錄不完整案件資訊</el-checkbox>
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
			<el-col :span="11" ref="container" class="container"/>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';

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
			template: {},
			inputForm: {
				sumInform_Num:0,
				informed_Num: 0,
				companyInform_Num: 0,
				unreasonable_Num: 0,
				roadSystem_Num:0,
				incomplete_Num: 0,
				companyCheck_Num: 0,
				supervisionCheckPass_Num: 0,
				supervisionCheckFail_Num: 0,
				organCheckPass_Num: 0,
				organCheckFail_Num: 0,
				totalIncomplete_Num: 0,
				EFA:0,
				EFGA:0,
				EFGHA:0,
				checkCo_dailyInform:true,
				checkCo_dailyLogin:true,
				checkPeriod_Complete:true,
				checkPeriod_IncompleteLogin:true,
				pass:false,
				fail:false,
				failReason: ''
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber: '1111102101',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				requiredStandard:'完成巡查工作後必須及時登錄資料',//要求標準
				measurement:'廠商於系統當天登錄資料數量/廠商當天通報數',//量測方式
				sumInform_Num: '0件',//A
				informed_Num: '0件',//B
				companyInform_Num: '0件',//C
				unreasonable_Num: '0件',//D
				roadSystem_Num:'0件',//E
				incomplete_Num: '0件',//F
				companyCheck_Num: '0件',
				supervisionCheckPass_Num: '0件',
				supervisionCheckFail_Num: '0件',//G
				organCheckPass_Num: '0件',
				organCheckFail_Num: '0件',//H
				totalIncomplete_Num: '0件',
				EFA:'',
				EFGA:'',
				EFGHA:'',
				checkCo_dailyInform:'',
				checkCo_dailyLogin:'',
				checkPeriod_Complete:'',
				checkPeriod_IncompleteLogin:'',
				pass:'',
				fail:'',
				failReason: '',
			},
		};
	},
	computed: { },
	watch: {},
	async created() {	
		// this.template = {};
		// this.form = {};
	},
	mounted() {
		this.initPDF();
	},
	methods: {
		dateShortcuts(index) {
			this.timeTabId = index;

			const DATE_OPTION = {
				TODAY: 0,
				YESTERDAY: 1,
				DAYBEFOREYEST: 2
			};

			switch (index) {
				case DATE_OPTION.TODAY:
					this.searchDate = moment();
					break;
				case DATE_OPTION.YESTERDAY:
					this.searchDate = moment().subtract(1, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST:
					this.searchDate = moment().subtract(2, "d");
					break;
			}
			this.getList();
		},
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
					if(['checkCo_dailyInform','checkCo_dailyLogin','checkPeriod_Complete','checkPeriod_IncompleteLogin','pass','fail'].includes(arg.key)){
						this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v')
					}
					if([
						'informed_Num',
						'companyInform_Num',
						'unreasonable_Num',
						'roadSystem_Num',
						'incomplete_Num',
						'companyCheck_Num',
						'supervisionCheckPass_Num',
						'supervisionCheckFail_Num',
						'organCheckPass_Num',
						'organCheckFail_Num',
						'totalIncomplete_Num'].includes(arg.key)) {
						this.inputForm[arg.key] = parseInt(arg.value)
					}
					if(['failReason'].includes(arg.key)){
						this.inputForm[arg.key] = arg.value
					}
				});
				this.setPDFinputs();
			})
		},
		setPDFinputs() {
			//檢查日期
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			//查核人次數
			for(const key of [
				'informed_Num',
				'companyInform_Num',
				'unreasonable_Num',
				'roadSystem_Num',
				'incomplete_Num',
				'companyCheck_Num',
				'supervisionCheckPass_Num',
				'supervisionCheckFail_Num',
				'organCheckPass_Num',
				'organCheckFail_Num',
				'totalIncomplete_Num']) {
				this.inputs[key] = this.inputForm[key] + '件';
			}
			//計算所有通報數(A)
			this.inputs.sumInform_Num = (this.inputForm.informed_Num+this.inputForm.companyInform_Num)+ '件';
			//計算指標數值
			const A = this.inputForm.informed_Num+this.inputForm.companyInform_Num;
			const E = this.inputForm.roadSystem_Num;
			const F = this.inputForm.incomplete_Num;
			const G = this.inputForm.supervisionCheckFail_Num;
			const H = this.inputForm.organCheckFail_Num;
			if(A==0){
				this.inputs.EFA='';this.inputs.EFGA='';this.inputs.EFGHA='';
			}else{
				this.inputs.EFA=String(((E-F)/A)*100)
				this.inputs.EFGA=String(((E-F-G)/A)*100)
				this.inputs.EFGHA=String(((E-F-G-H)/A)*100)
			}
			//應檢附文件
			for(const key of ['checkCo_dailyInform','checkCo_dailyLogin','checkPeriod_Complete','checkPeriod_IncompleteLogin','pass','fail']){
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}
			//否定原因填寫
			this.inputs.failReason=this.inputForm.failReason
			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		
		handleDownload() {
			// console.log(this.form);
			generate({ template: this.form.getTemplate(), inputs: this.form.getInputs(), options: { font: this.form.getFont() } }).then((pdf) => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const filename = "成效式契約指標檢核表PI-2-1.pdf"; 
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
		}
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
	.container
		position: fixed
		top:30px
		right:0
</style>