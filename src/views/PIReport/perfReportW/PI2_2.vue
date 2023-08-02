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
			<!-- <el-button class="filter-item" type="info" @click="setPDFinputs">更新內容</el-button> -->
		</div>

		<el-row :gutter="10">
			<el-col :span="12">
				<el-card shadow="never" style="width: 450px; margin: 20px auto; padding: 5px 10px;">
					<el-form :model="inputForm">
						<h3>登錄「道路管理資訊系統」資料之正確性</h3>
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
						<el-divider />
						<el-form-item label="正確判定處理原則案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.correct_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="認定不正確案件或發現錯誤案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.incorrect_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="廠商自主檢查件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyCheck_Num22" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
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
			<el-col :span="12" ref="container" class="container"/>
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
			labelWidth1:'135px',
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
				sumInform_Num22:0,
				informed_Num22: 0,
				companyInform_Num22: 0,
				unreasonable_Num22: 0,
				correct_Num22:0,
				incorrect_Num22: 0,
				companyCheck_Num22: 0,
				EFA_22:0,
				checkCorrect_doc22:true,
				checkIncorrect_doc22:true,
				checkSupervisionOrgan_doc22:true,
			},
			inputs: {
				contractName: '112年度大同區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber: '11206250201',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				requiredStandard_22:'判定道路維護處理(放入觀察區與查報區)必須正確',//要求標準
				measurement_22:'當周正確判定處理原則之案件數/廠商當周通報數',//量測方式
				sumInform_Num22: '0件',//A
				informed_Num22: '0件',//B
				companyInform_Num22: '0件',//C
				unreasonable_Num22: '0件',//D
				correct_Num22:'0件',//E
				incorrect_Num22: '0件',//F
				companyCheck_Num22: '0件',
				EFA_22:'',
				checkCorrect_doc22:'',
				checkIncorrect_doc22:'',
				checkSupervisionOrgan_doc22:'',
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
			fetch(`/assets/pdfW/PI2_2-Main.json?t=${Date.now()}`).then(async (response) => {
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
					console.log(arg);
					if(['checkCorrect_doc22','checkIncorrect_doc22','checkSupervisionOrgan_doc22'].includes(arg.key)){
						this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v')
					}
					if([
						'informed_Num22',
						'companyInform_Num22',
						'unreasonable_Num22',
						'correct_Num22',
						'incorrect_Num22',
						'companyCheck_Num22'].includes(arg.key)) {
						this.inputForm[arg.key] = parseInt(arg.value)
					}
					this.setPDFinputs();
				});
				this.setPDFinputs();
			})
		},
		setPDFinputs() {
			console.log('setPDFinputs');
			//檢查日期
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			//查核人次數
			for(const key of [
				'informed_Num22',
				'companyInform_Num22',
				'unreasonable_Num22',
				'correct_Num22',
				'incorrect_Num22',
				'companyCheck_Num22']) {
				this.inputs[key] = this.inputForm[key] + '件';
			}
			//計算所有通報數(A)
			this.inputs.sumInform_Num22 = (this.inputForm.informed_Num22+this.inputForm.companyInform_Num22)+ '件';
			//計算指標數值
			const A = this.inputForm.informed_Num22+this.inputForm.companyInform_Num22;
			const E = this.inputForm.correct_Num22;
			const F = this.inputForm.incorrect_Num22;
			if(A==0){
				this.inputs.EFA_22=''
			}else{
				this.inputs.EFA_22=String(((E-F)/A)*100)
			}
			//應檢附文件
			for(const key of ['checkCorrect_doc22','checkIncorrect_doc22','checkSupervisionOrgan_doc22']){
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}
			this.form.setInputs([this.inputs]);
			this.form.render();
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
</style>