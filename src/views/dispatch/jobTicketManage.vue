<template>
	<div class="app-container job-ticket-manage" v-loading="loading">
		<h2>派工單列表</h2>
		<div class="filter-container">
			<div class="filter-item">
				<!-- TODO: 設施未完成 -->
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>類型</span>
					</div>
					<el-select v-model.number="listQuery.deviceType" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.deviceType" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>

			<!-- <span class="filter-item">
				<div style="font-size: 12px; color: #909399">派工日期</div>
				<time-picker shortcutType="day" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
			</span> -->
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>廠商</span>
					</div>
					<el-select v-model.number="listQuery.contractor" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.guildMap" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>
			<br>

			<div class="filter-item">
				<div v-if="listQuery.filterType == 1" class="select-contract">
					<el-select v-model="listQuery.filterType" popper-class="type-select">
						<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
					<el-select v-model="listQuery.tenderId" class="dteam-select" placeholder="請選擇" popper-class="type-select" clearable @clear="listQuery.tenderId = null">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
				
				<el-input v-else v-model="listQuery.filterStr" placeholder="請輸入" style="width: 300px" >
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
					<el-select v-model="listQuery.tenderId" class="dteam-select" placeholder="請選擇" popper-class="type-select">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
			</div> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> --> 
			<el-checkbox v-model="listQuery.filter" style="margin-left: 20px">已刪除</el-checkbox>
		</div>

		<!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

		<el-table
			empty-text="目前沒有資料"
			:data="list"
			:key="deviceTypeNow"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
		>

			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:min-width="['Place'].includes(key) ? 80 : null"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'CaseNoArr' ].includes(column.property)">
						<!-- <span v-if="row.CaseNoArr.length != 0">{{ row.CaseNoArr.join("、") }}</span> -->
						<span v-if="row.CaseNoArr.length != 0">
							<span>{{ row.CaseNoArr.length }}</span>
							<el-tooltip effect="dark" placement="bottom">
								<span slot="content">
									<div v-for="caseNo in row.CaseNoArr" :key="caseNo">{{ caseNo }}</div>
								</span>
								<i class="icon-tooltip el-icon-warning" />
							</el-tooltip>
						</span>
						<span v-else> - </span>
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
						<!-- <span v-if="[ 'OrderSN' ].includes(column.property)">
							<span v-if="!row.IsActive" style="color: #F56C6C">(已刪除)</span>
							<span v-else-if="row.DateClose.length != 0" style="color: #67C23A">(已完成)</span>
						</span> -->
					</span>
				</template>
			</el-table-column>

			<el-table-column label="狀態" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.IsActive == 0" style="color: #F56C6C">刪除
						<!-- <i class="el-icon-close" style="color: #F56C6C" /> -->
					</span>
					<span v-else-if="row.DateClose.length != 0" style="color: #67C23A">完成
						<!-- <i class="el-icon-check" style="color: #67C23A" /> -->
					</span>
					<span v-else>
						<span> - </span>
						<!-- <el-button class="btn-action" type="danger" plain size="mini" round @click="setCaseStatus(row, 8)">刪除</el-button> -->
					</span>
				</template>
			</el-table-column>
			
			<el-table-column v-if="!filterNow" :key="filterNow" label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button v-if="row.DateClose.length == 0" type="info" size="mini" @click="reissueJobTicket(row)">補印派工單</el-button>
					<span v-else> - </span>
				</template>
			</el-table-column>
		</el-table>

		<!-- <pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" /> -->

		<!-- Dialog: 案件檢視 -->
		<el-dialog width="500px" title="案件檢視" :visible.sync="showConfirm">
			<div slot="footer" class="dialog-footer">
				<!-- <el-button @click="showDispatch = false">取消</el-button> -->
				<el-button type="primary" @click="showConfirm = false">確定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { getTenderMap, getGuildMap } from "@/api/type";
import { getJobTicketList, getJobTicketSpec } from "@/api/dispatch";

export default {
	name: "jobTicketManage",
	components: { },
	data() {
		return {
			loading: false,
			showConfirm: false,
			screenWidth: window.innerWidth,
			searchRange: "",
			deviceTypeNow: 1,
			filterNow: false,
			listQuery: {
				filter: false,
				filterType: 1,
				filterStr: null,
				tenderId: null,
				deviceType: 1,
				contractor: null,
				// pageCurrent: 1,
				// pageSize: 50,
			},
			headers: {
				OrderSN: {
					name: "派工單號",
					sortable: true
				},
				Contractor: {
					name: "廠商",
					sortable: false
				},
				OrderType: {
					name: "維護類型",
					sortable: false
				},
				CaseNoArr: {
					name: "案件數量",
					sortable: false
				},
				Creater: {
					name: "建單人員",
					sortable: false
				},
				DateAssign: {
					name: "建單時間",
					sortable: false
				},
				DateClose: {
					name: "完工時間",
					sortable: false,
				}
			},
			// total: 0,
			list: [],
			// detail: [],
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
					2: "派工單號"
				}
			}
		};
	},
	computed: { },
	watch: { },
	created() { 
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
			.then(res => res.blob())
			.then(async(blob) => readBlob(blob))
			.then(dataUri => dataUri.substr(dataUri.indexOf('base64,') + 7)).then(fontBString => {
				// init jsPDF
				this.pdfDoc = new jsPDF();
				this.pdfDoc.addFileToVFS("edukai.ttf", fontBString);
				this.pdfDoc.addFont("edukai.ttf", "edukai", "normal");
				this.pdfDoc.setFont("edukai");
			});
	},
	mounted() { },
	methods: {
		imgPreload() {
			//img preload
			this.imgDOMObj = {};
			this.caseSpec.forEach(l => { 
				let image = new Image();
				image.src = `/assets/testPic/${l.ImgZoomOut}`;
				this.imgDOMObj [l.CaseNo] = image;
			});
		},
		getList() {
			if (!Number(this.listQuery.contractor)) {
				this.$message({
					message: "請選擇廠商",
					type: "error",
				});
			} else {
				this.loading = true;
				this.list = [];
				this.deviceTypeNow = this.listQuery.deviceType;

				// let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
				// let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
				// this.searchRange = startDate + " - " + endDate;

				getJobTicketList({
					filter: this.listQuery.filter,
					contractor: this.listQuery.contractor,
					tenderId: this.listQuery.filterType == 1 ? this.listQuery.tenderId : null,
					dispatchSN: (this.listQuery.filterType == 2 && this.listQuery.filterStr) ? this.listQuery.filterStr : null,
					deviceType: this.listQuery.deviceType,
					// timeStart: startDate,
					// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
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
						this.filterNow = this.listQuery.filter;

						this.list.forEach(l => {
							l.Contractor = this.options.guildMap[l.Contractor];
							l.OrderType = this.options.deviceType[l.OrderType];
							l.CaseNoArr = l.CaseNoArr.filter(caseNo => Number(caseNo) != 0);
							l.DateAssign = this.formatDate(l.DateAssign);
							l.DateClose = this.formatDate(l.DateClose);
						})
					}
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		formatDate(time) {
			return time ? moment(time).format("YYYY-MM-DD"): "";
		},
		async createPdf(OrderSN) {
			return new Promise((resolve, reject) => {
				// PDF排版
				const fontSize = 14;
				const lineSize = (fontSize + 2) * 0.35;
				const { width, height } = this.pdfDoc.internal.pageSize;

				let tonneSUM = 0;
				let areaSUM = 0;
				const splitTable = this.caseSpec.reduce((acc, cur) => {
					tonneSUM += cur.tonne;
					areaSUM += cur.MillingArea;
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
					this.pdfDoc.text(`${today} 派工單號：  ${OrderSN}`, width - 15, lineSize + 25, { align: 'right' });

					if(pageIndex == 0) {
						this.pdfDoc.autoTable({ 
							columns: [
								{ header: '總面積', dataKey: 'areaSUMTitle' },
								{ header: String(Math.floor(areaSUM*10)/10), dataKey: 'areaSUM' },
								{ header: '總噸數', dataKey: 'tonneSUMTitle' },
								{ header: String(Math.floor(tonneSUM*10)/10), dataKey: 'tonneSUM' },
							],
							theme: 'plain',
							styles: { font: "edukai", valign: 'middle', cellPadding: { top: 1, right: 0.8, bottom: 1, left: 0.8 }, lineWidth: 0.5 },
							headStyles: { halign: 'center' },
							columnStyles: {
								areaSUMTitle: { halign: 'center', cellWidth: 32 },
								areaSUM: { halign: 'center', cellWidth: 16 },
								tonneSUMTitle: { halign: 'center', cellWidth: 32 },
								tonneSUM: { halign: 'center', cellWidth: 16 }
							},
							startY:  lineSize * 2 + 25
						});
					}

					this.pdfDoc.autoTable({ 
						// head: [[ '順序', '主任派工日期', '道管編號', '損壞類別', '維修地點', '算式', '面積', '深度', '頓數' ]],
						body: table.map((l, i) => ({ 
							order: (i+1) + 8*pageIndex, 
							// DatePlan: l.DatePlan, 
							CaseNo: l.CaseNo, 
							Postal_vil: l.Postal_vil,
							DistressName: l.DistressName, 
							Place: l.Place, 
							MillingFormula: (l.MillingFormula != '0') ? l.MillingFormula : `${l.MillingLength}*${l.MillingWidth}`, 
							MillingArea: l.MillingArea, 
							MillingDepth: l.MillingDepth,
							tonne: l.tonne,
							tonneRemain: Math.round((tonneSUM -= l.tonne)*10)/10
						})),
						columns: [
							{ header: '順序', dataKey: 'order' },
							// { header: '主任派工日', dataKey: 'DatePlan' },
							{ header: '道管編號', dataKey: 'CaseNo' },
							{ header: '里別', dataKey: 'Postal_vil' },
							{ header: '損壞類別', dataKey: 'DistressName' },
							{ header: '維修地點', dataKey: 'Place' },
							{ header: '預估算式', dataKey: 'MillingFormula' },
							{ header: '預估面積', dataKey: 'MillingArea' },
							{ header: '預估深度', dataKey: 'MillingDepth' },
							{ header: '噸數\n2.25', dataKey: 'tonne' },
							{ header: '剩餘噸數', dataKey: 'tonneRemain' },
							{ header: '實際算式', dataKey: 'acuMillingFormula' },
							{ header: '實際面積', dataKey: 'acuMillingArea' },
							{ header: '補繪標線', dataKey: 'marker' }
						],
						styles: { font: "edukai", valign: 'middle', fontSize: 9, cellPadding: { top: 1, right: 0.8, bottom: 1, left: 0.8 }, lineWidth: 0.2 },
						headStyles: { halign: 'center' },
						columnStyles: {
							order: { halign: 'center', cellWidth: 6 },
							// DatePlan: { halign: 'center', cellWidth: 24 },
							CaseNo: { halign: 'center', cellWidth: 22 },
							Postal_vil: { halign: 'center', cellWidth: 12 },
							DistressName: { halign: 'center', cellWidth: 10 },
							MillingFormula: { cellWidth: 26 },
							MillingArea: { halign: 'center', cellWidth: 10 },
							MillingDepth: { halign: 'center', cellWidth: 10 },
							tonne: { halign: 'center', cellWidth: 10 },
							tonneRemain: { halign: 'center', cellWidth: 10 },
							acuMillingFormula: { cellWidth: 16 },
							acuMillingArea: { halign: 'center', cellWidth: 10 },
							marker: { halign: 'center', cellWidth: 10 }
						},
						startY: this.pdfDoc.lastAutoTable.finalY + 2,
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

				resolve();
			});
		},
		reissueJobTicket(row) {
			console.log(row);
			getJobTicketSpec({
				dispatchSN: row.OrderSN,
				deviceType: this.listQuery.deviceType
			}).then(async(response) => {
				this.caseSpec = response.data.list;
				this.imgPreload();
				this.caseSpec.forEach((l, i) => {
					l.tonne = Math.round(l.MillingArea*l.MillingDepth*0.01*2.25*10) / 10;
				})
				this.createPdf(row.OrderSN).then(() => { this.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });
			}).catch(err => this.loading = false);
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.type-select .el-select-dropdown__item
	padding: 0 5px
	text-align: left
.job-ticket-manage
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
		.btn-action
			margin-left: 5px
			padding: 5px
	.btn-dialog
		padding: 5px 5px
</style>