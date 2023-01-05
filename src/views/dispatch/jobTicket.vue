<template>
	<div class="app-container job-ticket" v-loading="loading">
		<h2>製作派工單</h2>
		<div class="filter-container">
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>類型</span>
					</div>
					<el-select v-model.number="listQuery.deviceType" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.deviceType" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>

			<span class="filter-item">
				<div style="font-size: 12px; color: #909399">派工日期</div>
				<time-picker shortcutType="day" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
			</span>
			<br />

			<div class="filter-item">
				<div v-if="listQuery.filterType == 1" class="select-contract">
					<el-select v-model="listQuery.filterType" popper-class="type-select">
						<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
					<el-select v-model="listQuery.dteamSN" class="dteam-select" placeholder="請選擇" popper-class="type-select">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
				
				<el-input
					v-else
					v-model="listQuery.filterStr"
					placeholder="請輸入"
					style="width: 300px"
				>
					<el-select slot="prepend" v-model="listQuery.filterType" popper-class="type-select">
						<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
				</el-input>
			</div>
			
			<!-- <div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model="listQuery.dteamSN" class="dteam-select" placeholder="請選擇" popper-class="type-select">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
			</div> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> --> 
		</div>

		<h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5>

		<div class="filter-container">
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>廠商</span>
					</div>
					<el-select v-model.number="listQuery.workClass" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.guildMap" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>
			<el-tooltip effect="dark" content="請選擇廠商和案件" placement="bottom" :disabled="tableSelect.length != 0 && Number(listQuery.workClass) > 0">
				<span>
					<el-button class="filter-item" type="success" icon="el-icon-s-claim" :disabled="tableSelect.length == 0 || Number(listQuery.workClass) == 0" @click="previewPdf()">製作派工單</el-button>
				</span>
			</el-tooltip>
		</div>

		<el-table
			ref="assignTable"
			empty-text="目前沒有資料"
			:data="list"
			:key="deviceTypeNow"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
			@selection-change="handleCheckedChange"
		>
			<el-table-column type="selection" width="60" align="center" fixed>
				<template slot-scope="{ row, $index }">
					<el-checkbox v-model="checkList[$index]" style="margin-right: 5px" @change="cellCheckBox(row, $index)" />
					<span>{{ $index + 1 }}</span>
				</template>
			</el-table-column>
			<!-- <el-table-column type="index" label="序號" width="50" align="center" /> -->
			<el-table-column prop="CaseSN" label="申請單號" width="125" align="center" fixed sortable />
			<el-table-column prop="CaseNo" label="案件編號" width="130" align="center" fixed sortable>
				<template slot-scope="{ row }">
					<span>{{ row.CaseNo }}</span>
					<br>
					<span style="color: #909399; font-size: 12px">{{ row.DName }} ({{ row.casetype }})</span>
				</template>
			</el-table-column>

			<el-table-column
				v-for="(value, key) in headersFilter"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:min-width="['Place'].includes(key) ? 80 : null"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'MillingFormula' ].includes(column.property)">
						<span v-if="row.MillingFormula != '0'">{{ row.MillingFormula }}</span>
						<span v-else>{{ row.MillingLength }} * {{ row.MillingWidth }}</span>
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
			
			<el-table-column label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
						<el-button v-if="deviceTypeNow == 3" size="mini" @click="toggleExpand(row)">詳情</el-button>
						<!-- <el-button v-if="deviceTypeNow == 3" type="success" size="mini" @click="beforeEdit(row)">設計</el-button> -->
						<el-button type="info" size="mini" @click="showDetail(row)">檢視</el-button>
					</el-button-group>
				</template>
			</el-table-column>

			<el-table-column type="expand" width="1" align="center">
				<template slot-scope="props">
				</template>
			</el-table-column>
		</el-table>

		<!-- <pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" /> -->

		<!-- Dialog: 案件檢視 -->
		<el-dialog width="500px" title="案件檢視" :visible.sync="showDetailDialog">
			<case-detail ref="caseDetail" :loading.sync="loading" :showDetailDialog.sync="showDetailDialog" />
			<div slot="footer" class="dialog-footer">
				<!-- <el-button @click="showDispatch = false">取消</el-button> -->
				<el-button type="primary" @click="showDetailDialog = false">確定</el-button>
			</div>
		</el-dialog>

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
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getTenderMap, getGuildMap } from "@/api/type";
import { getJobTicket } from "@/api/dispatch";
import TimePicker from "@/components/TimePicker";
import CaseDetail from "@/components/CaseDetail";
// import Pagination from "@/components/Pagination";

export default {
	name: "jobTicket",
	components: { TimePicker, CaseDetail },
	data() {
		return {
			loading: false,
			showJobTicket: true,
			showDetailDialog: true,
			showConfirm: false,
			timeTabId: 1,
			dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			daterange: [
				moment().subtract(1, 'd').startOf("day").toDate(),
				moment().subtract(1, 'd').endOf("day").toDate(),
			],
			searchRange: "",
			deviceTypeNow: 1,
			listQuery: {
				filterType: 1,
				filterStr: null,
				dteamSN: null,
				deviceType: 1,
				workClass: null,
				// pageCurrent: 1,
				// pageSize: 50,
			},
			headers: {
				// CaseSN: {
				// 	name: "申請單號",
				// 	sortable: true,
				// },
				// CaseNo: {
				// 	name: "案件編號",
				// 	sortable: true,
				// },
				// CaseType: {
				// 	name: "查報來源",
				// 	sortable: false,
				// },
				// DName: {
				// 	name: "案件類型",
				// 	sortable: false,
				// },
				Contractor: {
					name: "廠商",
					sortable: false
				},
				Place: {
					name: "案件地點",
					sortable: false
				},
				DatePlan: {
					name: "主任派工日期",
					sortable: false
				},
				DateDeadline: {
					name: "預計完工日期",
					sortable: false
				},
				// estWorkingTime: {
				// 	name: "預計施作時段",
				// 	sortable: false
				// },
				MillingFormula: {
					name: "算式",
					sortable: false,
					deviceTypeFilter: [1, 2]
				},
				// MillingLength: {
				// 	name: "預計長度",
				// 	sortable: false
				// },
				// MillingWidth: {
				// 	name: "預計寬度",
				// 	sortable: false
				// },
				MillingArea: {
					name: "預估面積",
					sortable: false,
					deviceTypeFilter: [1, 2]
				},
				MillingDepth: {
					name: "刨鋪深度",
					sortable: false,
					deviceTypeFilter: [1, 2]
				},
				tonne: {
					name: "噸數",
					sortable: false,
					deviceTypeFilter: [1, 2]
				},
				IsPressing: {
					name: "急件",
					sortable: false,
					deviceTypeFilter: [ 3 ]
				},
				Notes: {
					name: "工程概述",
					sortable: false,
					deviceTypeFilter: [ 3 ]
				}
			},
			// total: 0,
			list: [],
			detail: [],
			rowActive: {},
			checkIndeterminate: false,
			checkList: [],
			tableSelect: [],
			options: {
				tenderMap: {},
				guildMap: {},
				deviceType: {
					1: "道路",
					2: "熱再生",
					3: "設施",
					4: "標線"
				},
				filterType: {
					1: "合約",
					2: "通報單號",
					3: "地點(關鍵字)"
				}
			}
		};
	},
	computed: {	
		headersFilter() {
			let headersFilter = {};
			Object.keys(this.headers).forEach(key => {
				const props = this.headers[key];
				if(!props.hasOwnProperty('deviceTypeFilter')) headersFilter[key] = props;
				else if(props.deviceTypeFilter.includes(this.deviceTypeNow)) headersFilter[key] = props;
			})
			return headersFilter
		},
	},
	watch: { },
	async created() {
		getTenderMap().then(response => { this.options.tenderMap = response.data.tenderMap });
		getGuildMap().then(response => { this.options.guildMap = response.data.guildMap });
		
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
			.then(blob => readBlob(blob))
			.then(dataUri => dataUri.substr(dataUri.indexOf('base64,') + 7)).then(fontBString => {
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
		this.showDetailDialog = false;

		this.$nextTick(() => {
			// init Viewer
			this.viewer = new Viewer({ 
				domContainer: this.$refs.pdfViewer, 
				template: { 
					basePdf: BLANK_PDF,
					schemas: [{ }]
				},
				inputs: [{ }] 
			});
		});
	},
	methods: {
		async handleCheckedChange(val) {
			this.tableSelect = val;
			if(this.tableSelect.length == this.list.length) this.tableSelect.forEach((_, index) => this.$set(this.checkList, index, true));
			if(this.tableSelect.length == 0) this.checkList = this.checkList.map(() => false);
		},
		cellCheckBox(row, index) {
			if(this.checkList[index]) this.$refs.assignTable.toggleRowSelection(row, true);
			else this.$refs.assignTable.toggleRowSelection(row, false);
		},
		toggleExpand(row) {
			this.$refs.assignTable.toggleRowExpansion(row)
		},
		imgPreload() {
			//img preload
			this.imgDOMObj = {};
			this.list.forEach(l => { 
				let image = new Image();
				image.src = `/assets/testPic/${l.ImgZoomOut}`;
				this.imgDOMObj [l.CaseNo] = image;
			});
		},
		getList() {
			this.loading = true;
			this.list = [];
			this.listQuery.workClass = null;

			let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
			this.searchRange = startDate + " - " + endDate;

			getJobTicket({
				dteamSN: this.listQuery.filterType == 1 ? this.listQuery.dteamSN : null,
				reportSN: (this.listQuery.filterType == 2 && this.listQuery.filterStr) ? this.listQuery.filterStr : null,
				keywords: (this.listQuery.filterType == 3 && this.listQuery.filterStr) ? this.listQuery.filterStr : null,
				deviceType: this.listQuery.deviceType,
				timeStart: startDate,
				timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
			}).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
					this.total = 0;
				} else {
					this.list = response.data.list;
					this.checkList = Array.from({ length: this.list.length }, () => false);
					this.deviceTypeNow = this.listQuery.deviceType;

					this.list.forEach(l => {
						l.DatePlan = this.formatDate(l.DatePlan);
						// this.$set(l, "detailTime", false);
						l.DateDeadline = (l.DateDeadline == null) ? moment(Number(String(l.CaseNo).substr(0, 7))+19110000, "YYYYMMDD", true).add(15, 'd').format("YYYY/MM/DD") : this.formatDate(l.DateDeadline);
						this.$set(l, "tonne", Math.round(l.MillingArea*l.MillingDepth*0.01*2.36*10) / 10);
					})

					this.imgPreload();
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		showDetail(row) {
			this.loading = true;
			this.$refs.caseDetail.getDetail(row);
		},
		formatDate(time) {
			return moment(time).format("YYYY-MM-DD");
		},
		async createPdf() {
			return new Promise((resolve, reject) => {
				// PDF排版
				const fontSize = 14;
				const lineSize = (fontSize + 2) * 0.35;
				const { width, height } = this.pdfDoc.internal.pageSize;

				const splitTable = this.tableSelect.reduce((acc, cur) => {
					if(acc[acc.length-1].length < 8) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);

					this.pdfDoc.setFontSize(fontSize+4);
					this.pdfDoc.setCharSpace(2);
					this.pdfDoc.text(`${this.options.deviceType[this.deviceTypeNow]} 維修派工單`, width / 2, 20, { align: 'center' });
					this.pdfDoc.setFontSize(fontSize);
					this.pdfDoc.setCharSpace(0);
					const today = `中華民國${moment().year()-1911}年${moment().format("MM年DD日")}`
					this.pdfDoc.text(`${today} 派工單號：           `, width - 15, lineSize + 25, { align: 'right' });
					this.pdfDoc.text(`(預覽列印)`, width - 15, lineSize + 25, { align: 'right' });

					this.pdfDoc.autoTable({ 
						// head: [[ '順序', '主任派工日期', '道管編號', '損壞類別', '維修地點', '算式', '面積', '深度', '頓數' ]],
						body: table.map((l, i) => ({ 
							order: (i+1) + 8*pageIndex, 
							DatePlan: l.DatePlan, 
							CaseNo: l.CaseNo, 
							DistressName: l.DistressName, 
							Place: l.Place, 
							MillingFormula: (l.MillingFormula != '0') ? l.MillingFormula : `${l.MillingLength}*${l.MillingWidth}`, 
							MillingArea: l.MillingArea, 
							MillingDepth: l.MillingDepth,
							tonne: l.tonne 
						})),
						columns: [
							{ header: '順序', dataKey: 'order' },
							{ header: '主任派工日', dataKey: 'DatePlan' },
							{ header: '道管編號', dataKey: 'CaseNo' },
							{ header: '損壞類別', dataKey: 'DistressName' },
							{ header: '維修地點', dataKey: 'Place' },
							{ header: '算式', dataKey: 'MillingFormula' },
							{ header: '面積', dataKey: 'MillingArea' },
							{ header: '深度', dataKey: 'MillingDepth' },
							{ header: '噸數', dataKey: 'tonne' }
						],
						styles: { font: "edukai", lineWidth: 0.2 },
						headStyles: { halign: 'center' },
						columnStyles: {
							order: { halign: 'center', valign: 'middle', cellWidth: 12 },
							DatePlan: { halign: 'center', valign: 'middle', cellWidth: 24 },
							CaseNo: { halign: 'center', valign: 'middle', cellWidth: 26 },
							DistressName: { halign: 'center', valign: 'middle', cellWidth: 20 },
							Place: { cellWidth: 30 },
							MillingArea: { halign: 'center', valign: 'middle', cellWidth: 14 },
							MillingDepth: { halign: 'center', valign: 'middle', cellWidth: 14 },
							tonne: { halign: 'center', valign: 'middle', cellWidth: 14 }
						},
						startY:  lineSize * 2 + 25,
						rowPageBreak: 'avoid'
					});

					// this.pdfDoc.setLineDashPattern([2, 1], 0);
					// this.pdfDoc.setDrawColor('#999999');
					// this.pdfDoc.line( 10, this.pdfDoc.lastAutoTable.finalY + 10, width - 10, this.pdfDoc.lastAutoTable.finalY + 10);
					// this.pdfDoc.setLineDashPattern([0], 0);

					const splitImgTable = table.reduce((acc, cur) => {
						if(acc[acc.length-1].length < 4) acc[acc.length-1].push(cur);
						else acc.push([cur]);
						return acc;
					}, [[]]);

					for(const [imgIndex, imgTable] of splitImgTable.entries()) {
						// let startY = this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0);
						// if(height - this.pdfDoc.lastAutoTable.finalY <= 70) startY = this.pdfDoc.lastAutoTable.finalY + 60;
						// console.log(startY);

						this.pdfDoc.autoTable({ 
							head: [ imgTable.map((l, i) => (`${(i+1) + 4*imgIndex + 8*pageIndex} - ${l.CaseNo}`)) ],
							// body: [ imgTable.map(l => l.ImgZoomOut) ],
							body: [ imgTable.map(l => l.CaseNo) ],
							theme: 'plain',
							styles: { font: "edukai", lineWidth: 0.2 },
							headStyles: { halign: 'center' },
							bodyStyles: { overflow: 'hidden', textColor: 255, cellWidth: 45, minCellHeight: 45, halign: 'center', valign: 'middle', fontSize: 1 }, 
							didDrawCell: async (data) => {
								if(data.cell.section === 'body') {
									// console.log(data);
									// this.pdfDoc.addImage(`/assets/testPic/${data.cell.raw}`, 'JPEG', data.cell.x, data.cell.y, 45, 45);
									this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
								}
							},
							startY: this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0),
							pageBreak: 'avoid'
						});
					}
				}

				// 頁數
				this.pdfDoc.setFontSize(fontSize-2);
				for(let pageNo=1; pageNo <= this.pdfDoc.internal.getNumberOfPages(); pageNo++) {
					this.pdfDoc.setPage(pageNo); 
					this.pdfDoc.text(`${pageNo} of ${this.pdfDoc.internal.getNumberOfPages()}`, width/2, height-10, { align: 'center' } );
				}

				this.viewer.updateTemplate({ 
					basePdf: this.pdfDoc.output('bloburl'), 
					schemas: [{ }]
				});

				resolve();
			});
		},
		previewPdf() {
			this.loading = true;

			this.createPdf().then(() => {
				this.loading = false;
				this.showJobTicket = true;
			})
		},
		downloadPdf() {
			this.pdfDoc.save("維修派工單.pdf");
		},
		async handleDownload() {
			// await this.dateWatcher();

			// const startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// const endDate = moment(this.daterange[1]).format("YYYY-MM-DD");

			getRoadUnit({
				pageCurrent: 1,
				pageSize: this.total
			}).then((response) => {
				let list = response.data.list;
				list.forEach(l => l.dist = this.districtList[l.zip].name);

				const tHeader = Object.values(this.headers).map((h) => h.name);
				const filterVal = Object.keys(this.headers);
				// tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
				// filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
				const data = this.formatJson(filterVal, list);

				import("@/vendor/Export2Excel").then((excel) => {
					excel.export_json_to_excel({
						header: tHeader,
						data,
					});
				});
			});
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map((v) => filterVal.map((j) => v[j]));
		},
	},
};
</script>

<style lang="sass">
*
	// border: 1px solid #000
	// box-sizing: border-box
.job-ticket
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 110px
				.el-input__inner
					padding-left: 3px
					padding-right: 10px
					text-align: center
				.el-input__suffix
					right: 0
					// margin-right: -5px
					transform: scale(0.7)
				&.dteam-select
					width: 520px
			.select-contract
				.el-select:first-child .el-input__inner
					background-color: #F5F7FA
					color: #909399
					border-right: none
					border-top-right-radius: 0
					border-bottom-right-radius: 0
					&:focus
						border-color: #DCDFE6
				.el-select:last-child .el-input__inner
					border-top-left-radius: 0
					border-bottom-left-radius: 0
					padding-left: 10px
					text-align: left
	.el-table
		.input-length, .input-width
			max-width: 60px
		.btn-tag
			cursor: pointer
		.el-table__expand-icon
			display: none
	.btn-dialog
		padding: 5px 5px
</style>