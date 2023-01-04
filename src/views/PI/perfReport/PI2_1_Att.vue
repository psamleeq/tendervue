<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI2.1附件</h2>
		<div class="filter-container">
			<span class="time-picker">
				<el-button-group v-if="!dateTimePickerVisible">
					<el-button
						v-for="(t, i) in pickerOptions.shortcuts"
						:key="i"
						type="primary"
						:plain="i != timeTabId"
						size="mini"
						@click="dateShortcuts(i)"
					>{{ t.text }}</el-button>
				</el-button-group>
				<el-date-picker
					v-else
					class="filter-item"
					v-model="searchDate"
					type="date"
					placeholder="日期"
					:picker-options="pickerOptions"
					:clearable="false"
					@change="timeTabId = -1"
				/>
				<el-button
					:type="dateTimePickerVisible ? 'info' : 'primary'"
					plain
					size="mini"
					@click="dateTimePickerVisible = !dateTimePickerVisible"
				>{{ dateTimePickerVisible ? '返回' : '進階' }}</el-button>
				<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
			</span>
			<el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				@click="handleDownload"
			>輸出PDF</el-button>
			<!-- <el-button class="filter-item" type="info" @click="setPDFinputs">更新內容</el-button> -->
		</div>

		<el-row :gutter="24">
			<el-col :span="10">
				<el-card shadow="never" style="width: 400px; margin: 40px auto; padding: 5px 10px;">
					<el-form :model="inputForm" label-width="100px">
						<h2>通報資訊</h2>
						<el-divider />
						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />

						<h3>廠商通報</h3>
						<el-form-item label="行政區">
							<el-input v-model="inputs.district" style="width: 200px" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="本日通報">
							<el-input-number v-model="inputForm.caseReportTotal" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />

						<h3>系統登錄</h3>
						<h4>路面: </h4>
						<el-form-item label="觀察區">
							<el-input-number v-model="inputForm.ACTotal_Obs" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="正式區">
							<el-input-number v-model="inputForm.ACTotal_Reg" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>

						<h4>設施: </h4>
						<el-form-item label="觀察區">
							<el-input-number v-model="inputForm.facTotal_Obs" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="正式區">
							<el-input-number v-model="inputForm.facTotal_Reg" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="14" ref="container" />
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { getCaseCount } from "@/api/PI";

export default {
	name: "PI2_1_Att",
	components: { },
	data() {
		return {
			loading: false,
			timeTabId: 1,
			initPage: 2,
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
				caseReportTotal: 0,
				ACTotal_Obs: 0,
				ACTotal_Reg: 0,
				facTotal_Obs: 0,
				facTotal_Reg: 0
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				serialNumber1: '1111102102',
				serialNumber2: '1111102103',
				date: '111年11月02日',
				district: '中山區',
				caseReportTotal: '0 筆',
				ACTotal_Obs: '0 筆',
				ACTotal_Reg: '0 筆',
				facTotal_Obs: '0 筆',
				facTotal_Reg: '0 筆',
				info1: '無',
				info2: '無'
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
			fetch(`/assets/pdf/PI2_1-Att.json?t=${Date.now()}`).then(async (response) => {
				const domContainer = this.$refs.container.$el;
				this.template = await response.json();

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					},
					// NotoSansTC: {
					// 	data: await fetch('/assets/font/NotoSansTC-Regular.ttf').then(res => res.arrayBuffer()),
					// 	fallback: true
					// }
				};

				this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				this.form.onChangeInput(arg => {
					console.log(arg);
					// if(['contractName', 'companyName', 'serialNumber', 'date', 'district'].includes(arg.key)) this.inputs[arg.key] = arg.value;
					if(['caseReportTotal', 'ACTotal_Obs', 'ACTotal_Reg', 'facTotal_Obs', 'facTotal_Reg'].includes(arg.key)) this.inputForm[arg.key] = parseInt(arg.value);
				});
				this.getList();
			})
		},
		setPDFinputs() {
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			for(let i=0; i < this.template.schemas.length; i++) {
				this.inputs[`serialNumber${i+1}`] = date.format("YYYYMMDD01").slice(1) + String(i+this.initPage).padStart(2, '0');
			}
			for(const key of [ 'caseReportTotal', 'ACTotal_Obs', 'ACTotal_Reg', 'facTotal_Obs', 'facTotal_Reg' ]) {
				this.inputs[key] = this.inputForm[key] + ' 筆';
			}
			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		getList() {
			this.loading = true;

			const date = moment(this.searchDate).format("YYYY-MM-DD");
			this.list = [];

			getCaseCount({
				timeStart: date,
				timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD")
			}).then(response => {
				this.inputForm.caseReportTotal = Number(response.data.result.caseReportTotal);
				this.inputForm.ACTotal_Obs = Number(response.data.result.ACTotal_Obs);
				this.inputForm.facTotal_Obs = Number(response.data.result.facTotal_Obs);

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

				const filename = "成效式契約指標檢核表(附件)PI-2-1.pdf"; 
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
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.PI2_1-Att
	.filter-container 
		.filter-item
			margin-right: 5px
		.time-picker 
			& > *
				margin-right: 5px
			.el-date-editor.el-input
				width: 165px
				.el-input__inner
					width: 155px
					padding: 0 10px
</style>