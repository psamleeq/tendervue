<template>
	<div class="app-container PI3_1-Att" v-loading="loading">
		<h2>PI3.1附件</h2>
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
					<el-form label-width="100px">
						<h2>工安登錄</h2>
						<el-divider />
						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="頁數調整">
							<el-button-group>
								<el-button type="success" size="small" icon="el-icon-plus" @click="addPage()" />
								<el-button type="danger" size="small" icon="el-icon-minus" :disabled="template.schemas != undefined && template.schemas.length <= 2" @click="removePage()" />
								<span v-if="template.schemas != undefined" style="margin-left: 5px">(目前頁數: {{ template.schemas.length }})</span>
							</el-button-group>
						</el-form-item>
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
						<!-- <span v-for="(inputForm, index) in inputFormArr" :key="`form_${index}`"> -->
						<el-collapse v-model="activeName">
							<el-collapse-item v-for="(inputForm, index) in inputFormArr" :key="`form_${index}`" class="collapse-label" :title="`${inputForm.serialNumber} (P${index+1})`" :name="index">
								<template slot="title">
									<span>{{ inputForm.serialNumber }} (P{{ index+1 }})</span>
									<el-button class="btn-remove" type="danger" size="mini" plain :disabled="template.schemas != undefined && template.schemas.length <= 2" @click="removePage(index)">刪除</el-button>
									<!-- <el-button type="text" style="margin-left: 5px" :disabled="template.schemas != undefined && template.schemas.length <= 2" @click="removePage"><i class="el-icon-close" style="color: #F56C6C" /></el-button> -->
								</template>
								<!-- <el-divider>{{ inputForm.serialNumber }} (P{{ index+1 }})</el-divider> -->
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
									<el-input v-model="inputForm.reason" @change="setPDFinputs" />
								</el-form-item>
							</el-collapse-item>
						</el-collapse>
						<!-- </span> -->
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="14" ref="container" id="container" />
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { PDFDocument } from 'pdf-lib';
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
			activeName: [0],
			template: {},
			inputFormArr: [
				{
					serialNumber: "",
					checkVest: false,		// 反光背心
					checkIdCard: false,	// 識別證
					checkWhistle: false,	// 哨子
					checkNum: 0,
					failNum: 0,
					reason: "無"
				},
				{
					serialNumber: "",
					checkVest: false,		// 反光背心
					checkIdCard: false,	// 識別證
					checkWhistle: false,	// 哨子
					checkNum: 0,
					failNum: 0,
					reason: "無"
				}
			],
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				serialNumber1: '1111102105',
				serialNumber2: '1111102106',
				serialNumber3: '1111102107',
				date: '111年11月02日',
				district: '中山區',
				checkVest1: '',		// 反光背心
				checkIdCard1: '',	// 識別證
				checkWhistle1: '',	// 哨子
				checkNum1: '0',
				passNum1: '0',
				failNum1: '0',
				reason1: '無',
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
			fetch(`/assets/pdf/PI3_1-Att.json?t=${Date.now()}`).then(async (response) => {
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
					// const key = arg.key.slice(0, arg.key.length-1);
					// const index = arg.key.slice(arg.key.length-1);
					const [key, index] = arg.key.split(/([a-zA-Z]+)(\d?)/g).filter(s => s.length > 0);
					// console.log(key, index);
					// if(index == undefined) this.inputs[arg.key] = arg.value;
					if(['serialNumber', 'reason'].includes(key)) this.inputFormArr[index-1][key] = arg.value;
					if(['checkVest', 'checkIdCard', 'checkWhistle'].includes(key)) this.inputFormArr[index-1][key] = (arg.value == 'V' || arg.value == 'v');
					if(['checkNum', 'failNum', 'passNum'].includes(key)) this.inputFormArr[index-1][key] = Number(arg.value);
				});
				this.setPDFinputs();
				// this.getList();
			})
		},
		async addPage() {
			this.loading = true;

			//Step1: 合併PDF
			const ori_pdfUint8 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const ori_pdf = await PDFDocument.load(ori_pdfUint8.buffer);

			const addTemplate = await fetch(`/assets/pdf/PI3_1-Att_1.json?t=${Date.now()}`).then(response => response.json());
			const add_pdfUint8 = Uint8Array.from(window.atob(addTemplate.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const add_pdf = await PDFDocument.load(add_pdfUint8.buffer);
			// const addPdfBytes = await fetch(`/assets/pdf/PI3_1-Att_1.pdf?t=${Date.now()}`).then(res => res.arrayBuffer());
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
			this.template.schemas.splice(this.template.schemas.length-1, 0, addTemplate.schemas[0]);
			this.inputFormArr.push({
					serialNumber: "",
					checkVest: false,		// 反光背心
					checkIdCard: false,	// 識別證
					checkWhistle: false,	// 哨子
					checkNum: 0,
					failNum: 0,
					reason: "無"
			})

			this.setTemplate();
		},
		async removePage(index) {
			this.loading = true;

			//Step1: 移除頁面
			const ori_pdfUint8 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
			const ori_pdf = await PDFDocument.load(ori_pdfUint8.buffer);
			index = (index != undefined) ? index : ori_pdf.getPageCount()-2;
			// const lastIndex = ori_pdf.getPageCount()-2;
			ori_pdf.removePage(index);

			this.template.basePdf = await ori_pdf.saveAsBase64({ dataUri: true });

			//Step2: 調整欄位
			this.template.schemas.splice(index, 1);
			this.inputFormArr.splice(index, 1);
			this.setTemplate();
		},
		setTemplate() {
			for(let i=0; i<this.template.schemas.length; i++) {
				for(const keySpec of [ 'serialNumber', 'checkImg', 'checkVest', 'checkIdCard', 'checkWhistle', 'checkNum', 'failNum', 'passNum', 'reason' ]) {
					if(keySpec != 'serialNumber' && i == this.template.schemas.length-1) continue;
					const keyFilter = Object.keys(this.template.schemas[i]).filter(key => key.includes(keySpec))[0];
					if(keyFilter == `${keySpec}${i+1}`) continue;
					this.template.schemas[i][`${keySpec}${i+1}`] = this.template.schemas[i][keyFilter]; 
					delete this.template.schemas[i][keyFilter];
				}
			}

			this.form.updateTemplate(this.template);
			this.setPDFinputs();
		},
		setPDFinputs() {
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			for(let i=0; i < this.template.schemas.length; i++) {
				this.inputs[`serialNumber${i+1}`] = date.format("YYYYMMDD01").slice(1) + String(i+this.initPage).padStart(2, '0');
			}

			for(let [ i, inputForm ] of this.inputFormArr.entries()) {
				inputForm.serialNumber = this.inputs[`serialNumber${i+1}`];
				for(const key of [ 'checkVest', 'checkIdCard', 'checkWhistle' ]) this.inputs[`${key}${i+1}`] = inputForm[key] ? 'V' : '';
				this.inputs[`checkNum${i+1}`] = String(inputForm.checkNum);
				this.inputs[`failNum${i+1}`] = String(inputForm.failNum);
				this.inputs[`passNum${i+1}`] = String(inputForm.checkNum - inputForm.failNum);
				this.inputs[`reason${i+1}`] = inputForm.reason;
			}

			this.form.setInputs([this.inputs]);
			// this.form.render();
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
.PI3_1-Att
	.collapse-label
		width: 100%
		.el-collapse-item__header
			padding: 5px 25px
			background-color: #F2F6FC
			position: relative
			&.is-active
				background-color: rgba(#F2F6FC, 0.5)
				transition: 0.5s
			.el-collapse-item__arrow
				position: absolute
				left: 5px
			.btn-remove
				margin-left: 5px
				padding: 3px 5px
				position: absolute
				right: 20px
		.el-collapse-item__content
			height: 100%
			padding-bottom: 5px
					
	// .el-row
	// 	position: relative
	// 	height: 100%
	// 	#container
	// 		position: relative
	// 		height: 100%
</style>