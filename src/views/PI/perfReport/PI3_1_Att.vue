<template>
	<div class="app-container PI3_1-Att" v-loading="loading">
		<h2>日報表-PI3.1附件</h2>
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
			<el-col :span="10">
				<el-card shadow="never" style="width: 400px; margin: 40px auto; padding: 5px 10px;">
					<el-form :model="inputForm" label-width="100px">
						<h2>工安登錄</h2>
						<el-divider />
						<el-form-item label="日期">
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

						<el-form-item label="項目">
							<el-checkbox v-model="inputForm.checkVest" @change="setPDFinputs">反光背心</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkIdCard" @change="setPDFinputs">識別證</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkWhistle" @change="setPDFinputs">哨子</el-checkbox>
						</el-form-item>
						<el-form-item label="檢查人數">
							<el-input-number v-model="inputForm.checkNum" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="未符人數">
							<el-input-number v-model="inputForm.failNum" controls-position="right" :min="0" :max="inputForm.checkNum" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="原因">
							<el-input v-model="inputs.reason" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />

						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="頁數調整">
							<el-button-group>
								<el-button type="success" size="small" icon="el-icon-plus" @click="addPage" />
								<el-button type="danger" size="small" icon="el-icon-minus" :disabled="template.schemas != undefined && template.schemas.length <= 2" @click="removePage" />
								<span v-if="template.schemas != undefined" style="margin-left: 5px">(目前頁數: {{ template.schemas.length }})</span>
							</el-button-group>
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
import { PDFDocument } from 'pdf-lib'
// import { getCaseCount } from "@/api/PI";

export default {
	name: "PI3_1_Att",
	components: { },
	data() {
		return {
			loading: false,
			timeTabId: 1,
			initPage: 5,
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
				checkVest: false,		// 反光背心
				checkIdCard: false,	// 識別證
				checkWhistle: false,	// 哨子
				checkNum: 0,
				failNum: 0
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				serialNumber: '1111102102',
				date: '111年11月02日',
				district: '中山區',
				checkVest: '',		// 反光背心
				checkIdCard: '',	// 識別證
				checkWhistle: '',	// 哨子
				checkNum: '0',
				passNum: '0',
				failNum: '0',
				reason: '無',
				info1: '無未滿足',
				info2: '無未滿足',
				info3: '無未滿足'
			}
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
		initPDF() {
			fetch(`/assets/pdf/PI3-1.json?t=${Date.now()}`).then(async (response) => {
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
				this.form.onChangeInput(arg => console.log(arg));
				this.setPDFinputs();
				// this.getList();
			})
		},
		async addPage() {
			this.loading = true;

			//Step1: 合併PDF
			const ori_pdfUint8 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const ori_pdf = await PDFDocument.load(ori_pdfUint8.buffer);

			const addTemplate = await fetch(`/assets/pdf/PI3-1-1.json?t=${Date.now()}`).then(response => response.json());
			const add_pdfUint8 = Uint8Array.from(window.atob(addTemplate.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const add_pdf = await PDFDocument.load(add_pdfUint8.buffer);
			// const addPdfBytes = await fetch(`/assets/pdf/PI3-1-1.pdf?t=${Date.now()}`).then(res => res.arrayBuffer());
			// const add_pdf = await PDFDocument.load(addPdfBytes);
			const mergedPdf = await PDFDocument.create();

			const ori_copiedPages = await mergedPdf.copyPages(ori_pdf, ori_pdf.getPageIndices());
			const [ add_copiedPage ] = await mergedPdf.copyPages(add_pdf, [0]);
			ori_copiedPages.forEach(page => mergedPdf.addPage(page));
			mergedPdf.insertPage(ori_pdf.getPageCount()-1, add_copiedPage);

			// const mergedPdfFile = await mergedPdf.save();
			// const blob = new Blob([mergedPdfFile.buffer], { type: 'application/pdf' });
			// window.open(URL.createObjectURL(blob));
			this.template.basePdf = await mergedPdf.saveAsBase64({ dataUri: true });

			//Step2: 調整欄位
			const lastIndex = this.template.schemas.length-1;
			addTemplate.schemas[0][`serialNumber${lastIndex+1}`] = addTemplate.schemas[0].serialNumber1; 
			delete addTemplate.schemas[0].serialNumber1;
			addTemplate.schemas[0][`checkImg${lastIndex+1}`] = addTemplate.schemas[0].checkImg1;
			delete addTemplate.schemas[0].checkImg1;
			this.template.schemas.splice(lastIndex, 0, addTemplate.schemas[0]);

			this.setTemplate();
		},
		async removePage() {
			this.loading = true;

			//Step1: 移除頁面
			const ori_pdfUint8 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const ori_pdf = await PDFDocument.load(ori_pdfUint8.buffer);
			const lastIndex = ori_pdf.getPageCount()-2;
			ori_pdf.removePage(lastIndex);

			this.template.basePdf = await ori_pdf.saveAsBase64({ dataUri: true });

			//Step2: 調整欄位
			this.template.schemas.splice(lastIndex, 1);
			console.log(this.template.schemas);
			this.setTemplate();
		},
		setTemplate() {
			const lastIndex = this.template.schemas.length-1;
			const key_SN = Object.keys(this.template.schemas[lastIndex]).filter(key => key.includes("serialNumber"))[0];
			this.template.schemas[lastIndex][`serialNumber${lastIndex+1}`] = this.template.schemas[lastIndex][key_SN]; 
			delete this.template.schemas[lastIndex][key_SN];

			this.form.updateTemplate(this.template);
			this.setPDFinputs();
		},
		setPDFinputs() {
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			for(let i=0; i < this.template.schemas.length; i++) {
				this.inputs[`serialNumber${i+1}`] = date.format("YYYYMMDD01").slice(1) + String(i+this.initPage).padStart(2, '0');
			}
			for(const key of [ 'checkVest', 'checkIdCard', 'checkWhistle' ]) {
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}

			this.inputs.checkNum = String(this.inputForm.checkNum);
			this.inputs.failNum = String(this.inputForm.failNum);
			this.inputs.passNum = String(this.inputForm.checkNum - this.inputForm.failNum);

			this.form.setInputs([this.inputs]);
			this.form.render();
			this.loading = false;
		},
		// getList() {
		// 	this.loading = true;

		// 	const date = moment(this.searchDate).format("YYYY-MM-DD");
		// 	this.list = [];

		// 	getCaseCount({
		// 		timeStart: date,
		// 		timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD")
		// 	}).then(response => {
		// 		this.inputForm.caseReportTotal = Number(response.data.result.caseReportTotal);

		// 		this.setPDFinputs();
		// 		this.loading = false;
		// 	}).catch(err => this.loading = false);
		// },
		handleDownload() {
			// console.log(this.form);
			generate({ template: this.form.getTemplate(), inputs: this.form.getInputs(), options: { font: this.form.getFont() } }).then((pdf) => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const filename = "成效式契約指標檢核表(附件)PI-3-1.pdf"; 
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
// .PI3_1-Att
</style>