<template>
	<div class="app-container">
		<h2>PI-2.1附件</h2>
		<div style="display:flex;justify-content: flex-end;">
			<el-button type="primary" @click="downloadPdf()" style="margin:10px">確定列印</el-button>
		</div>
		
		<div ref="pdfViewer" />
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { generate } from '@pdfme/generator';
import { Viewer, BLANK_PDF } from '@pdfme/ui';

export default {
	name: "inspectionListPdf",
	components: { },
	// props: {
	// 	loading: {
	// 		required: true,
	// 		type: Boolean
	// 	},
	// 	tableSelect: {
	// 		default: () => [],
	// 		type: Array
	// 	},
	// },
	data() {
		return {
			showJobTicket: true,
			pdfSetting: {
				format: 'a4',
				fontSize: 14,
				lineHeight: (14 + 2) * 0.35,
				orientation: 'p'
			},
			dataList:[
				{ id: 112062600010, name: '里長', item: '設施', address: '長安東路一段23號',reason: '該缺失為對外排水溝，被施工修補 之水泥堵住，' },
				{ id: 112062600011, name: '里長', item: '設施', address: '中山北路一段135巷37-1號',reason: '因雨天積水排水問題，經現勘旁有溝蓋可排水' }
			]
		}
	},
	computed: {	},
	watch: {
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
	created() {
		this.imgDOMObj = {};

		// 讀入字型
		const readBlob = (blob) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(blob);
			});
		};

		fetch('/assets/font/edukai-4.0.ttf')
			// .then(res => res.arrayBuffer())
			// .then(arrayBuffer => window.btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte))));
			.then(res => res.blob())
			.then(async(blob) => { 
				this.viewer = new Viewer({ 
					domContainer: this.$refs.pdfViewer, 
					template: { 
						basePdf: BLANK_PDF,
						schemas: [{ }]
					},
					inputs: [{ }],
					options: {
						font:{
							edukai: {
								data: await blob.arrayBuffer(),
								fallback: true
							}
						}
					}
				});

				return readBlob(blob); 
			}).then(dataUri => dataUri.substr(dataUri.indexOf('base64,') + 7)).then(fontBString => {
				// console.log(fontBString);

				// init jsPDF
				this.pdfDoc = new jsPDF();
				this.pdfDoc.addFileToVFS("edukai.ttf", fontBString);
				this.pdfDoc.addFont("edukai.ttf", "edukai", "normal");
				this.pdfDoc.setFont("edukai");
				this.previewPdf()
			});

		
	},
	mounted() { 
		this.showJobTicket = false;
		
	},
	methods: {
		bodyRows(rowCount, data) {
			rowCount = rowCount || 10
			var body = []
			for (var j = 0; j <= rowCount; j++) {
				if (data[j]) {
					body.push({
						id: data[j].id,
						name: data[j].name,
						item: data[j].item,
						address: data[j].address,
						reason: data[j].reason
					});
				} else {
					body.push({
						id: '',
						name: '',
						item: '',
						address: '',
					});
				}
			}
			
			return body
		},
		headRows() {
			return [
				{ id: '案件編號', name: '通報者', item: '缺失項目', address:'地 點', reason:'原 因' },
			]
		},
		async createPdf() {
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;
				this.pdfDoc.setFontSize(15)
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12)
				this.pdfDoc.text(`項目:【PI-2.1附件】`, width-190, height-270, { align: 'left' })
				this.pdfDoc.text(`日報表`, width-40, height-270, { align: 'left' })

				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`111年度中山區道路巡查維護修繕成效式契約`,'紀錄編號',`11206230102-1`]],
					body: [['施工廠商','聖東營造股份有限公司','檢查日期',`112年6月23日`]],
					startY: height-265,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日被通報案件(議員、單一陳情、管區……等)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				
				let body1 = this.bodyRows(10,this.dataList)
				this.pdfDoc.autoTable({
					columns: [
						{ dataKey: 'id', header: '案件編號' },
						{ dataKey: 'name', header: '通報者' },
						{ dataKey: 'item', header: '缺失項目' },
						{ dataKey: 'address', header: '地 點' },
					],
					body: body1,
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, halign: 'center'	},
					columnStyles: { id: { cellWidth:30 }, name: { cellWidth:25 }, item: { cellWidth:25 }, address: { cellWidth:'auto',halign:'left' } },		
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日被通報案件(1999)']],
					body: [[{content: '',styles: { minCellHeight: 40 }}]],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, minCellHeight: 20 },
					head: [['廠商:']],
					// body: [[]],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})


				// 第二頁
				this.pdfDoc.addPage(this.pdfSetting.format, this.pdfSetting.orientation);
				this.pdfDoc.setFontSize(15)
				this.pdfDoc.text(`成效式契約指標檢核表`, width/2, height-280, { align: 'center' });
				this.pdfDoc.setFontSize(12)
				this.pdfDoc.text(`項目:【PI-2.1附件】`, width-190, height-270, { align: 'left' })
				this.pdfDoc.text(`日報表`, width-40, height-270, { align: 'left' })
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['工程名稱',`112年度中山區道路巡查維護修繕成效式契約`,'紀錄編號',`11206230102-2`]],
					body: [['施工廠商','聖東營造股份有限公司','檢查日期',`112年6月23日`]],
					startY: height-265,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10 },
					head: [['當日廠商判定不合理案件(1999、議員、單一陳情、管區……等)']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				let head2 = this.headRows()
				let body2 = this.bodyRows(5,this.dataList)
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, halign: 'center'},
					columnStyles: { id: { cellWidth:30 }, name: { cellWidth:25 }, item: { cellWidth:25 }, address: { cellWidth:50, halign:'left' }, reason: { halign:'left' } },
					head: head2,
					body: body2,
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				this.pdfDoc.autoTable({
					theme: 'plain',
					styles: { font: "edukai", fontSize: 12, lineWidth: 0.1, lineColor: 10, minCellHeight: 20 },
					head: [['廠商:']],
					startY: this.pdfDoc.lastAutoTable.finalY,
				})
				
				resolve();
			})
		},
		
		previewPdf(isInstant = false) {
			this.$emit('update:loading', true);
			this.createPdf().then(() => {
				const schemas = Array.from({ length: this.pdfDoc.internal.getNumberOfPages() }, () => (
					{
						"OrderSN": {
							"type": "text",
							"position": {
								"x": 10,
								"y": 10
							},
							"width": 27.24,
							"height": 6.12,
							"fontSize": 14,
							"alignment": "center"
						}
					}
				));

				this.viewer.updateTemplate({ basePdf: this.pdfDoc.output('bloburl'), schemas });

				if(isInstant) this.downloadPdf();
				else {
					this.viewer.setInputs([{ "OrderSN": "(預覽列印)" }]);

					this.$emit('update:loading', false);
					this.showJobTicket = true;	
				}
			})
		},
		downloadPdf() {
			this.viewer.setInputs([{ "OrderSN": '' }]);
			this.showJobTicket = false;
			this.handleDownload(`PI2.1附件.pdf`);
		},
		handleDownload(filename) {
			generate({ template: this.viewer.getTemplate(), inputs: this.viewer.getInputs(), options: { font: this.viewer.getFont() } }).then(pdf => {
				console.log(pdf);
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
}
</script>

<style lang="sass">
</style>