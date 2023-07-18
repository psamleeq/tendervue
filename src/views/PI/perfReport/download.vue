<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>日報表編輯列表</h2>
		<div class="filter-container">
			<el-table 
			:data="list"
			empty-text="目前沒有資料"
			border
			fit
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%"
			>
				<el-table-column
					type="index"
					label="序號"
					width="60"
					align="center">
				</el-table-column>
				<el-table-column
					prop="editDate"
					label="編輯日期">
				</el-table-column>
				<el-table-column
					prop="name"
					label="編輯人員">
				</el-table-column>
				<el-table-column label="動作" align="center">
					<template slot-scope="{ row }">
						<el-button-group>
							<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
							<el-button type="info" plain size="mini" @click="previewPdf()" ><i class="el-icon-download"></i>下載</el-button>
							<!-- @child-method="handleChildMethod" -->
						</el-button-group>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- Dialog: PDF預覽 -->
		<el-dialog width="800px" title="預覽" :visible.sync="showPdfDialog">
			<div ref="pdfViewer" />
			<div slot="footer" class="dialog-footer">
				<el-button @click="showPdfDialog = false">取消</el-button>
				<el-button type="primary" @click="downloadPdf()">確定列印</el-button>
			</div>
		</el-dialog>
		
		<PI21Att2 ref="PI21Att2" :message="message" style="display:none"></PI21Att2>
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { PDFDocument } from 'pdf-lib';
import { generate } from '@pdfme/generator';
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import PI21Att2 from '@/views/PI/perfReport/component/PI21Att2.vue'

export default {
	name: "perfReportList",
	components:{PI21Att2},
	data() {
		return {
			message:{
				zipCode:103,
				searchDate:'2023-07-18',
				startDate:'2023-06-01',
				endDate:'2023-06-01',
				imageUrl:'',
				initPage:3,
			},
			loading: false,
			showPdfDialog:false,
			template:{},
			list:[
				{
					editDate:'2023/07/01' ,
					name:'Hannah',
				}
			],
			inputs: {
				//共同
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				serialNumber: '1111102105',
				date: '111年11月02日',
				zipCode: '104',
				district: '中山區',

				//PI3.1_Att
				checkVest1: 'V',		// 反光背心
				checkIdCard1: 'V',	// 識別證
				checkWhistle1: 'V',	// 哨子
				checkNum1: '0',
				passNum1: '0',
				failNum1: '0',
				reason1: '無',
				info1: '無未滿足',
				info2: '無未滿足',
				info3: '無未滿足',

				//PI3.1
				requiredStandard_31:'廠商人員執行工作應滿足安全性要求',//要求標準
				measurement_31:'當天滿足要求人次數/當日工作執行日報填寫人數',//量測方式
				dailyReport_Num31: '0 件',//A
				qualifiedSafety_Num31: '0 件',//B
				unqualifiedSafety_Num31: '0 件',//C
				companyCheck_Num31:'0 件',
				BCA_31:'',
				checkCo_dailyInspectAll31:'',
				checkCo_discoverUnSafety31:'',
				checkOr_discoverUnSafety31:'',
				checkCo_unreasonable31:'',

				//PI2.1_Att_3
				info1_21Att: '無',
				info2_21Att: '無',

				//PI2.1_Att_1
				caseReportTotal: '0',
				ACTotal_Obs: '0',
				ACTotal_Reg: '0',
				facTotal_Obs: '0',
				facTotal_Reg: '0',
				caseReportImg:'',
				caseReportImg_neo1:'',
				caseReportImg_neo2:'',
				caseReportImg_neo3:'',

				//PI2.1
				requiredStandard_21:'完成巡查工作後必須及時登錄資料',//要求標準
				measurement_21:'廠商於系統當天登錄資料數量/廠商當天通報數',//量測方式
				sumInform_Num21: '0件',//A
				informed_Num21: '0件',//B
				companyInform_Num21: '0件',//C
				unreasonable_Num21: '0件',//D
				roadSystem_Num21:'0件',//E
				incomplete_Num21: '0件',//F
				companyCheck_Num21: '0件',
				EFA_21:'',
				checkCo_dailyInform21:'',
				checkCo_dailyLogin21:'',
				checkPeriod_Complete21:'',
				checkPeriod_IncompleteLogin21:'',
			},
			// result: ''
		};
	},
	computed: { },
	watch: {},
	mounted() {
	},
	methods: {
		beforeEdit(row){
			this.$router.push({
				path: "/PIIndex/perfReportD/perfReportList",
				query: { row },
			})
		},
		async previewPdf(isInstant = false) {
			this.showPdfDialog = true;
			await this.$refs.PI21Att2.getList();
			console.log(this.$refs.PI21Att2);
			
			fetch(`/assets/pdf/PI3_1-Att.json?t=${Date.now()}`).then(async (response) => {
				const domContainer = this.$refs.pdfViewer;
				this.template = await response.json();
				//PI3.1
				//Step1: 合併PDF
				const ori_pdfUint8_1 = Uint8Array.from(window.atob(this.template.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const ori_pdf_1 = await PDFDocument.load(ori_pdfUint8_1.buffer);

				const addTemplate_1 = await fetch(`/assets/pdf/PI3_1-Main.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_2 = await fetch(`/assets/pdf/PI2_1-Att_3.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_3 = await fetch(`/assets/pdf/PI2_1-Att.json?t=${Date.now()}`).then(response => response.json());
				const addTemplate_4 = await fetch(`/assets/pdf/PI2_1-Main.json?t=${Date.now()}`).then(response => response.json());
				// console.log(addTemplate_1);
				
				const add_pdfUint8_1 = Uint8Array.from(window.atob(addTemplate_1.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_2 = Uint8Array.from(window.atob(addTemplate_2.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_jspdf = Uint8Array.from(window.atob(this.$refs.PI21Att2.result.replace(/^data:application\/pdf;filename=generated.pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_3 = Uint8Array.from(window.atob(addTemplate_3.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
				const add_pdfUint8_4 = Uint8Array.from(window.atob(addTemplate_4.basePdf.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));

				const add_pdf_1 = await PDFDocument.load(add_pdfUint8_1.buffer);
				const add_pdf_2 = await PDFDocument.load(add_pdfUint8_2.buffer);
				const add_pdf_jspdf = await PDFDocument.load(add_pdfUint8_jspdf.buffer);
				const add_pdf_3 = await PDFDocument.load(add_pdfUint8_3.buffer);
				const add_pdf_4 = await PDFDocument.load(add_pdfUint8_4.buffer);

				const mergedPdf = await PDFDocument.create();
	
				const ori_copiedPages_1 = await mergedPdf.copyPages(ori_pdf_1, ori_pdf_1.getPageIndices());
				const [ add_copiedPage_1 ] = await mergedPdf.copyPages(add_pdf_1, [0]);
				const [ add_copiedPage_2 ] = await mergedPdf.copyPages(add_pdf_2, [0]);
				const [ add_copiedPagef_jspdf1,add_copiedPagef_jspdf2 ] = await mergedPdf.copyPages(add_pdf_jspdf, [0,1]);
				const [ add_copiedPage_3 ] = await mergedPdf.copyPages(add_pdf_3, [0]);
				const [ add_copiedPage_4 ] = await mergedPdf.copyPages(add_pdf_4, [0]);

				ori_copiedPages_1.forEach(page => mergedPdf.addPage(page));
				mergedPdf.insertPage(0, add_copiedPage_1);
				mergedPdf.insertPage(0, add_copiedPage_2);
				mergedPdf.insertPage(0, add_copiedPagef_jspdf2);
				mergedPdf.insertPage(0, add_copiedPagef_jspdf1);
				mergedPdf.insertPage(0, add_copiedPage_3);
				mergedPdf.insertPage(0, add_copiedPage_4);
	
				this.template.basePdf = await mergedPdf.saveAsBase64({ dataUri: true });
				// //Step2: 調整欄位
				this.template.schemas.splice(0, 0, addTemplate_1.schemas[0]);
				this.template.schemas.splice(0, 0, addTemplate_2.schemas[0]);
				this.template.schemas.splice(0, 0, {});
				this.template.schemas.splice(0, 0, {});
				this.template.schemas.splice(0, 0, addTemplate_3.schemas[0]);
				this.template.schemas.splice(0, 0, addTemplate_4.schemas[0]);
				// console.log(this.template);

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					},
				};
				this.viewer = new Viewer({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				// console.log(this.viewer);
				// this.viewer.updateTemplate(this.template);
				
				// console.log(this.viewer);
				
			});
			// if(isInstant) this.downloadPdf();
			// else {
			// 	this.viewer.setInputs([{ "OrderSN": "(預覽列印)" }]);
			// 	this.showPdfDialog = true;	
			// }
		},
		downloadPdf() {
			this.viewer.setInputs([{ "OrderSN": '' }]);
			this.showPdfDialog = false;
			this.handleDownload(`日報表.pdf`);
		},
		handleDownload(filename) {
			generate({ template: this.viewer.getTemplate(), inputs: this.viewer.getInputs(), options: { font: this.viewer.getFont() } }).then(pdf => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

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
		
	}
};
</script>

<style lang="sass">
</style>