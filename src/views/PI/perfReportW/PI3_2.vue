<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI3.2</h2>
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
						<h3>執行維護工作之時效性</h3>
						<el-divider />
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
						
						<el-form-item label="廠商當周所有維護案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.maintainAll_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<h4>廠商每周於規定時間內完成維護工作之案件總數</h4>
						<el-form-item label="接獲通報案件於1小時內到達現場且回報修復情形案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.Hr1_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="4小時內完成臨補或設置安全措施案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.Hr4_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="坑洞查報次日起15日內(含例假日)修復完成含標線復原案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.Day15_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="標線復原案件於修復完成後2日內(含例假日)將標線復原案件數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.Day2_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="未滿足契約時間要求案件資訊" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.failTime_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="廠商自主檢查人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyCheck_Num32" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						
						<h4>應檢附文件</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.checkInTime_doc32" @change="setPDFinputs">滿足與未滿足各項契約時間要求資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCoFail_doc32" @change="setPDFinputs">廠商自主發現未滿足契約要求案件資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkSandOFail_doc32" @change="setPDFinputs">機關或監造抽查檢核後發現未滿足要求的案件數資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCoUnreason_doc32" @change="setPDFinputs">廠商認為為滿足判定不合理資訊</el-checkbox>
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
				maintainAll_Num32:0,
				Hr1_Num32: 0,
				Hr4_Num32: 0,
				Day15_Num32: 0,
				Day2_Num32:0,
				failTime_Num32: 0,
				companyCheck_Num32: 0,
				EFA_32:0,
				checkInTime_doc32:true,
				checkCoFail_doc32:true,
				checkSandOFail_doc32:true,
				checkCoUnreason_doc32:true,
			},
			inputs: {
				contractName: '112年度大同區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber: '11206250201',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				requiredStandard_32:'判定道路維護處理(放入觀察區與查報區)必須正確',//要求標準
				measurement_32:'當周正確判定處理原則之案件數/廠商當周通報數',//量測方式
				maintainAll_Num32: '0 件',//A
				Hr1_Num32: '0 件',
				Hr4_Num32: '0 件',
				Day15_Num32: '0 件',
				Day2_Num32:'0 件',
				sumCompleteMaintain_Num32:'0 件',
				failTime_Num32: '0 件',//C
				companyCheck_Num32: '0 件',
				EFA_32:'',
				checkInTime_doc32:'',
				checkCoFail_doc32:'',
				checkSandOFail_doc32:'',
				checkCoUnreason_doc32:'',
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
			fetch(`/assets/pdfW/PI3_2-Main.json?t=${Date.now()}`).then(async (response) => {
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
					if(['checkInTime_doc41','checkCoFail_doc41','checkSandOFail_doc41','checkCoUnreason_doc41'].includes(arg.key)){
						this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v')
					}
					if([
						'maintainAll_Num41',
						'hole_Num41',
						'sidewalk_Num41',
						'crack_Num41',
						'uplift_Num41',
						'failContractRequire_Num41',
						'companyCheck_Num41'].includes(arg.key)) {
						this.inputForm[arg.key] = parseInt(arg.value)
					}
					this.setPDFinputs();
				});
				
			})
		},
		setPDFinputs() {
			console.log('setPDFinputs');
			//檢查日期
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			//查核人次數
			for(const key of [
				'maintainAll_Num41',
				'hole_Num41',
				'sidewalk_Num41',
				'crack_Num41',
				'uplift_Num41',
				'failContractRequire_Num41',
				'companyCheck_Num41']) {
				this.inputs[key] = this.inputForm[key] + ' 件';
			}
			//計算(B)
			this.inputs.sumQualified_Num41 = (this.inputForm.hole_Num41+this.inputForm.sidewalk_Num41+this.inputForm.crack_Num41+this.inputForm.uplift_Num41)+ ' 件';
			//計算指標數值
			const A = this.inputForm.maintainAll_Num41;
			const B = this.inputForm.hole_Num41+this.inputForm.sidewalk_Num41+this.inputForm.crack_Num41+this.inputForm.uplift_Num41;
			const C = this.inputForm.failContractRequire_Num41;
			if(A==0){
				this.inputs.BCA_41=''
			}else{
				this.inputs.BCA_41=String(((B-C)/A)*100)
			}
			//應檢附文件
			for(const key of ['checkInTime_doc41','checkCoFail_doc41','checkSandOFail_doc41','checkCoUnreason_doc41']){
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