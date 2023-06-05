<template>
	<div class="job-ticket-pdf">
		<el-button-group>
			<el-button type="info" icon="el-icon-s-claim" :disabled="tableSelect.length == 0" @click="previewPdf()">預覽</el-button>
			<el-button type="primary" icon="el-icon-download" :disabled="tableSelect.length == 0" @click="previewPdf(true)">列印</el-button>
		</el-button-group>

		<!-- Dialog: PDF預覽 -->
		<el-dialog width="800px" title="預覽" :visible.sync="showJobTicket">
			<div ref="pdfViewer" />
			<div slot="footer" class="dialog-footer">
				<el-button @click="showJobTicket = false">取消</el-button>
				<el-button type="primary" @click="downloadPdf()">確定列印</el-button>
			</div>
		</el-dialog>
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
	props: {
		loading: {
			required: true,
			type: Boolean
		},
		tableSelect: {
			default: () => [],
			type: Array
		},
	},
	data() {
		return {
			showJobTicket: true,
			pdfSetting: {
				format: 'a4',
				fontSize: 14,
				lineHeight: (14 + 2) * 0.35,
				orientation: 'p'
			}
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
			});
	},
	mounted() { 
		this.showJobTicket = false;
	},
	methods: {
		// imgPreload(data) {
		// 	//img preload
		// 	this.imgDOMObj = {};
		// 	data.forEach(l => { 
		// 		let image = new Image();
		// 		image.src = l.ImgZoomOut;
		// 		this.imgDOMObj [l.CaseNo] = image;
		// 	});
		// },
		async createPdf() {
			return new Promise((resolve, reject) => {
				const splitTable = this.tableSelect.reduce((acc, cur) => {
					if(acc[acc.length-1].length < 1) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);
				// console.log(splitTable);
				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage(this.pdfSetting.format,this.pdfSetting.orientation)
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					console.log( pageIndex, table);
					const { width, height } = this.pdfDoc.internal.pageSize;
					//表頭
					this.pdfDoc.setFontSize(this.pdfSetting.fontSize+4);
					this.pdfDoc.setTextColor('#000000');
					this.pdfDoc.setCharSpace(2);
					this.pdfDoc.text(`修復申請單`, width / 2, 20, { align: 'center' });

					//內容
					this.pdfDoc.setFontSize(this.pdfSetting.fontSize);
					this.pdfDoc.setCharSpace(0);
					this.pdfDoc.text(`編　　號:`, width - 195, height-267, { align: 'left' });
					this.pdfDoc.text(`${table[0].id}`, width - 170, height-267, { align: 'left' });
					this.pdfDoc.text(`道管系統案號:`, width - 100, height-267, { align: 'left' });
					this.pdfDoc.text(`道管AAAAAAAAAAA`, width - 65, height-267, { align: 'left' });
					this.pdfDoc.text(`工程名稱:`, width - 195, height-257, { align: 'left' });
					this.pdfDoc.text(`BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`, width - 170, height-259, { align: 'left',maxWidth:60 });
					this.pdfDoc.text(`座　　　　標:`, width - 100, height-257, { align: 'left' });
					this.pdfDoc.text(`座標11111111111`, width - 65, height-259.5, { align: 'left',maxWidth:60 });
					this.pdfDoc.text(`座標22222222222`, width - 65, height-254.5, { align: 'left',maxWidth:60 });
					this.pdfDoc.text(`修復地點:`, width - 195, height-246, { align: 'left' });
					this.pdfDoc.text(`CCCCCC`, width - 170, height-246, { align: 'left' });
					this.pdfDoc.text(`修 復　項 目:`, width - 100, height-246, { align: 'left' });
					this.pdfDoc.text(`${table[0].caseName}`, width - 65, height-246, { align: 'left' });
					this.pdfDoc.text(`申請日期:`, width - 195, height-237, { align: 'left' });
					this.pdfDoc.text(`DDDDDDD`, width - 170, height-237, { align: 'left' });
					this.pdfDoc.text(`預定施工日期:`, width - 100, height-237, { align: 'left' });
					this.pdfDoc.text(`SSSSSSSSSSSSS`, width - 65, height-237, { align: 'left' });
					this.pdfDoc.text(`預 定　數 量:`, width - 100, height-227, { align: 'left' });
					this.pdfDoc.text(`RRRRRRRRRRRR`, width - 65, height-227, { align: 'left' });

					//圖片
					this.pdfDoc.autoTable({ 
						head: [['修復地點相片']],
						// body: [ imgTable.map(l => l.ImgZoomOut) ],
						body: ['img'],
						theme: 'plain',
						styles: { font: "edukai", lineWidth: 0.5, lineColor: 10},
						headStyles: { halign: 'center',fontSize:14 },
						bodyStyles: { overflow: 'hidden', textColor: 255, cellWidth: 130, minCellHeight: 75, halign: 'center', valign: 'middle' }, 
						// didDrawCell: (data) => {
						// 	if(data.cell.section === 'body') {
						// 		// console.log(data);
						// 		this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
						// 	}
						// },
						margin: 40,
						startY: height-222,
						pageBreak: 'avoid'
					});
					this.pdfDoc.autoTable({ 
						head: [['臨時修補相片']],
						// body: [ imgTable.map(l => l.ImgZoomOut) ],
						body: ['img'],
						theme: 'plain',
						styles: { font: "edukai", lineWidth: 0.5, lineColor: 10 },
						headStyles: { halign: 'center',fontSize:14},
						bodyStyles: { overflow: 'hidden', textColor: 255, cellWidth: 130, minCellHeight: 75, halign: 'center', valign: 'middle' }, 
						// didDrawCell: (data) => {
						// 	if(data.cell.section === 'body') {
						// 		// console.log(data);
						// 		this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
						// 	}
						// },
						margin: 40,
						startY: height-134,
						pageBreak: 'avoid'
					});

					this.pdfDoc.text(`工程師`, width - 185, height-38, { align: 'left' });
					this.pdfDoc.text(`專案組長`, width - 125, height-38, { align: 'left' });
					this.pdfDoc.text(`專案組任`, width - 55, height-38, { align: 'left' });
				}

				

				resolve();
			})
		},
		
		previewPdf(isInstant = false) {
			console.log(this.tableSelect);
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
			this.$emit("downloadPdf", () => {
				this.viewer.setInputs([{ "OrderSN": '' }]);
				this.showJobTicket = false;
				this.handleDownload(`修復申請單.pdf`);
				// this.pdfDoc.save(`維修派工單_${orderSN}.pdf`);
			});
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