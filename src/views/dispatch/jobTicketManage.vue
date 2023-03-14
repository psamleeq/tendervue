<template>
	<div class="app-container job-ticket-manage" v-loading="loading">
		<h2>派工單管理</h2>
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

			<span class="filter-item">
				<div style="font-size: 12px; color: #909399">建單日期</div>
				<time-picker shortcutType="year" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
			</span>
			<div class="filter-item">
				<el-input v-model="listQuery.filterStr" placeholder="請輸入" style="width: 300px" >
					<span slot="prepend">派工單號</span>
				</el-input>
			</div>
			
			<!-- <div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model="listQuery.tenderId" class="tender-select" placeholder="請選擇" popper-class="type-select tender">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
			</div> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> --> 
			<el-checkbox v-model="listQuery.filter" style="margin-left: 20px">已退回</el-checkbox>
		</div>

		<h5 v-if="list.length != 0 && (!listQuery.filterStr || listQuery.filterStr.length == 0)">查詢期間：{{ searchRange }}</h5>

		<el-table
			empty-text="目前沒有資料"
			:data="list"
			:key="deviceTypeNow"
			border
			fit
			:row-class-name="tableRowClassName"
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%"
		>

			<el-table-column v-if="!filterNow" label="退回" width="60" align="center" fixed>
				<template slot-scope="{ row }">
					<el-button v-if="row.DateClose.length == 0 && deviceTypeNow != 4" type="danger" size="mini" style="padding: 5px" @click="beforeRemove(row, 1)">主任</el-button>
					<span v-else> - </span>
				</template>
			</el-table-column>

			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:min-width="['Amount'].includes(key) ? 60 : 30"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'CaseNoArr' ].includes(column.property)">
						<!-- <span v-if="row.CaseNoArr.length != 0">{{ row.CaseNoArr.join("、") }}</span> -->
						<span v-if="row.CaseNoActiveArr.length != 0">
							<span>{{ row.CaseNoActiveArr.length }}</span>
							<el-tooltip effect="dark" placement="bottom">
								<span slot="content">
									<div v-for="(caseNo, index) in row.CaseNoActiveArr" :key="`${caseNo}_${index}`">{{ caseNo }}
										<span v-if="row.CaseIsCancelArr && row.CaseIsCancelArr[index] == 1" style="color: #909399">(不需施作)</span>
									</div>
									<div v-for="caseNo in row.CaseNoInActiveArr" :key="caseNo">{{ caseNo }}<span style="color: #F56C6C">(退回)</span></div>
								</span>
								<i class="icon-tooltip el-icon-warning" />
							</el-tooltip>
						</span>
						<span v-else> - </span>
					</span>
					<span v-else-if="[ 'Amount' ].includes(column.property)">
						<el-input v-if="row.edit && row.DateClose.length != 0" v-model.number="row.Amount" style="width: 80%" />
						<span v-else>{{ row.DateClose.length != 0 ? row.Amount : "-" }}</span>
						<el-button v-if="row.DateClose.length != 0 && !row.edit" type="text" style="margin-left: 10px" size="mini" @click="row.edit = true"><i class="el-icon-edit" /></el-button>
						<span v-if="row.edit">
							<el-button type="text" @click="editJobTicketAmt(row)"><i class="el-icon-check" style="color: #67C23A"/></el-button>
							<el-button type="text" style="margin-left: 5px" @click="row.edit=false; getList()"><i class="el-icon-close" style="color: #F56C6C" /></el-button> 
						</span>
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

			<el-table-column :key="deviceTypeNow" label="狀態" min-width="30" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.IsActive == 0" style="color: #F56C6C">退回
						<!-- <i class="el-icon-close" style="color: #F56C6C" /> -->
					</span>
					<span v-else-if="row.DateClose.length != 0" style="color: #67C23A">完成
						<!-- <i class="el-icon-check" style="color: #67C23A" /> -->
					</span>
					<span v-else>
						<span>施工中</span>
						<!-- <el-button class="btn-action" type="danger" plain size="mini" round @click="setCaseStatus(row, 8)">退回</el-button> -->
					</span>
				</template>
			</el-table-column>
			
			<el-table-column v-if="!filterNow" :key="filterNow" label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="primary" plain size="mini" @click="showTicketDetail(row)">檢視</el-button>
					<el-button v-if="row.DateClose.length == 0" class="btn-action" type="success" plain size="mini" @click="editJobTicket(row)">編輯</el-button>
					<el-button v-if="row.DateClose.length == 0" class="btn-action" type="info" size="mini" @click="reissueJobTicket(row)">補印派工單</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- <pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" /> -->

		<!-- Dialog: 案件退回 -->
		<el-dialog
			:visible.sync="showRevokeConfirm"
			width="300px"
			:show-close="false"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
		>	
			<span slot="title">
				<span v-if="rowActive.revokeType == 1">確認退回 派工單號{{ rowActive.OrderSN }} 至「主任分派」?</span>
				<!-- <span v-else-if="rowActive.revokeType == 2">確認退回 派工單號{{ rowActive.OrderSN }} 至「製作派工單」?</span> -->
			</span>
			<div v-if="rowActive.revokeType == 1">原因: 
				<el-select v-model="rowActive.revokeReason">
					<el-option v-for="( name, key ) in options.reasonType" :key="key" :label="name" :value="Number(key)" />
				</el-select>
			</div>
			<span slot="footer" class="footer-btns">
				<el-button @click="showRevokeConfirm = false; getList();">取消</el-button>
				<el-button type="primary" @click="removeDispatch()">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { getTenderMap, getGuildMap } from "@/api/type";
import { getJobTicketList, getJobTicketSpec, setJobTicketAmt, revokeDispatch } from "@/api/dispatch";
import TimePicker from "@/components/TimePicker";

export default {
	name: "jobTicketManage",
	components: { TimePicker },
	data() {
		return {
			loading: false,
			showRevokeConfirm: false,
			screenWidth: window.innerWidth,
			timeTabId: 2,
			daterange: [
				moment().startOf("month").toDate(),
				moment().endOf("day").toDate(),
			],
			searchRange: "",
			deviceTypeNow: 1,
			contractorNow: "",
			filterNow: false,
			listQuery: {
				filter: false,
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
				},
				Amount: {
					name: "總金額",
					sortable: false,
				}
			},
			// total: 0,
			list: [],
			// detail: [],
			rowActive: {},
			options: {
				tenderMap: {},
				guildMap: {},
				deviceType: {
					1: "道路",
					2: "熱再生",
					3: "設施",
					4: "標線"
				},
				reasonType: {
					1: "無需施作",
					2: "退回重派"
				}
			},
			pdfSetting: {
				fontSize: 14,
				lineHeight: (14 + 2) * 0.35
			}
		};
	},
	computed: { },
	watch: {
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
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
		tableRowClassName({row, rowIndex}) {
			if (row.DateClose.length != 0) return 'success-row';
			return '';
		},
		imgPreload() {
			//img preload
			this.imgDOMObj = {};
			this.caseSpec.forEach(l => { 
				let image = new Image();
				image.src = l.ImgZoomOut;
				this.imgDOMObj [l.CaseNo] = image;
			});
		},
		getList(showMsg = true) {
			if (!Number(this.listQuery.contractor)) {
				this.$message({
					message: "請選擇廠商",
					type: "error",
				});
			} else {
				this.loading = true;
				this.list = [];
				this.deviceTypeNow = this.listQuery.deviceType;

				let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
				let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
				this.searchRange = startDate + " - " + endDate;

				getJobTicketList({
					filter: this.listQuery.filter,
					contractor: this.listQuery.contractor,
					dispatchSN: this.listQuery.filterStr,
					deviceType: this.listQuery.deviceType,
					timeStart: startDate,
					timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
				}).then(response => {
					if (response.data.list.length == 0) {
						if(showMsg) this.$message({
							message: "查無資料",
							type: "error",
						});
						this.total = 0;
					} else {
						this.list = response.data.list;
						this.checkList = Array.from({ length: this.list.length }, () => false);
						this.deviceTypeNow = this.listQuery.deviceType;
						this.contractorNow = this.listQuery.contractor;
						this.filterNow = this.listQuery.filter;

						this.list.forEach(l => {
							l.Contractor = this.options.guildMap[l.Contractor];
							l.OrderType = this.options.deviceType[l.OrderType];
							l.CaseNoActiveArr = l.CaseNoActiveArr.filter(caseNo => Number(caseNo) != 0);
							l.CaseNoInActiveArr = l.CaseNoInActiveArr.filter(caseNo => Number(caseNo) != 0);
							l.DateAssign = this.formatDate(l.DateAssign);
							l.DateClose = this.formatDate(l.DateClose);

							this.$set(l, "edit", false);
						})
					}
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		formatDate(time) {
			return time ? moment(time).format("YYYY-MM-DD"): "";
		},
		showTicketDetail(row) {
			this.$router.push({
				path: "/dispatch/finRegister",
				query: { deviceType: this.deviceTypeNow, contractor: this.contractorNow, orderSN: row.OrderSN },
			});
		},
		async createPdf_header(OrderSN) {
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;
				const contractor = this.options.guildMap[this.contractorNow];
				this.pdfDoc.setFontSize(this.pdfSetting.fontSize-4);
				this.pdfDoc.setTextColor('#999999');
				this.pdfDoc.text(`(廠商) ${contractor}`, 15, 10 );

				const subTitle = (this.deviceTypeNow == 1) ? "AC" : this.options.deviceType[this.deviceTypeNow];
				this.pdfDoc.setFontSize(this.pdfSetting.fontSize+4);
				this.pdfDoc.setTextColor('#000000');
				this.pdfDoc.setCharSpace(2);
				this.pdfDoc.text(`道路(${subTitle}) 維修派工單`, width / 2, 20, { align: 'center' });

				const today = `中華民國${moment().year()-1911}年${moment().format("MM年DD日")}`;
				this.pdfDoc.setFontSize(this.pdfSetting.fontSize);
				this.pdfDoc.setCharSpace(0);
				this.pdfDoc.text(`${today} 派工單號：  ${OrderSN}`, width - 15, this.pdfSetting.lineHeight + 25, { align: 'right' });
				// this.pdfDoc.text(`(預覽列印)`, width - 15, this.pdfSetting.lineHeight + 25, { align: 'right' });

				resolve();
			})
		},
		async createPdf_footer() {
			return new Promise((resolve, reject) => {
				const { width, height } = this.pdfDoc.internal.pageSize;

				// 頁數
				this.pdfDoc.setFontSize(this.pdfSetting.fontSize-2);
				for(let pageNo=1; pageNo <= this.pdfDoc.internal.getNumberOfPages(); pageNo++) {
					this.pdfDoc.setPage(pageNo); 
					this.pdfDoc.text(`${pageNo} of ${this.pdfDoc.internal.getNumberOfPages()}`, width/2, height-10, { align: 'center' } );
				}

				resolve();
			})
		},
		async createPdf_AC(OrderSN) {
			return new Promise(async (resolve, reject) => {
				const pageSize = 8;

				// PDF排版
				let tonneSUM = 0;
				let areaSUM = 0;
				const splitTable = this.caseSpec.reduce((acc, cur) => {
					tonneSUM += cur.tonne;
					areaSUM += cur.MillingArea;
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				const tonneSUMHeader = tonneSUM;
				const areaSUMHeader = areaSUM;

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header(OrderSN);

					this.pdfDoc.autoTable({ 
						columns: [
							{ header: '總面積', dataKey: 'areaSUMTitle' },
							{ header: String(Math.floor(areaSUMHeader*10)/10), dataKey: 'areaSUMHeader' },
							{ header: '總噸數', dataKey: 'tonneSUMTitle' },
							{ header: String(Math.floor(tonneSUMHeader*10)/10), dataKey: 'tonneSUMHeader' },
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
						startY:  this.pdfSetting.lineHeight * 2 + 25
					});

					this.pdfDoc.autoTable({ 
						// head: [[ '順序', '主任分派日期', '道管編號', '損壞類別', '維修地點', '算式', '面積', '深度', '頓數' ]],
						body: table.map((l, i) => ({ 
							order: (i+1) + pageSize*pageIndex, 
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
							// { header: '主任分派日', dataKey: 'DatePlan' },
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
									this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
								}
							},
							startY: this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0),
							pageBreak: 'avoid'
						});
					}
				}

				await this.createPdf_footer();
				resolve();
			});
		},
		async createPdf_HR(OrderSN) {
			return new Promise(async (resolve, reject) => {
				const pageSize = 8;

				// PDF排版
				const splitTable = this.caseSpec.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header(OrderSN);

					this.pdfDoc.autoTable({ 
						// head: [[ '順序', '主任分派日期', '道管編號', '損壞類別', '維修地點', '算式', '面積', '深度', '頓數' ]],
						body: table.map((l, i) => ({ 
							order: (i+1) + pageSize*pageIndex, 
							// DatePlan: l.DatePlan, 
							CaseNo: `${l.CaseNo}\n${l.CaseSN}`, 
							DistressName: l.DistressName,
							Place: `${l.Postal_vil}\n${l.Place}`,
							MillingFormula: (l.MillingFormula != '0') ? l.MillingFormula : `${l.MillingLength}*${l.MillingWidth}`, 
							MillingArea: l.MillingArea
						})),
						columns: [
							{ header: '順序', dataKey: 'order' },
							// { header: '主任分派日', dataKey: 'DatePlan' },
							{ header: '道管編號', dataKey: 'CaseNo' },
							{ header: '損壞類別', dataKey: 'DistressName' },
							{ header: '維修地點', dataKey: 'Place' },
							{ header: '預估算式', dataKey: 'MillingFormula' },
							{ header: '預估面積', dataKey: 'MillingArea' },
							{ header: '實際算式', dataKey: 'acuMillingFormula' },
							{ header: '實際面積', dataKey: 'acuMillingArea' },
							{ header: '補繪標線', dataKey: 'marker' }
						],
						styles: { font: "edukai", valign: 'middle', fontSize: 9, cellPadding: { top: 1, right: 0.8, bottom: 1, left: 0.8 }, lineWidth: 0.2 },
						headStyles: { halign: 'center' },
						columnStyles: {
							order: { halign: 'center', cellWidth: 6 },
							CaseNo: { halign: 'center', cellWidth: 26 },
							Place: { cellWidth: 26 },
							DistressName: { halign: 'center', cellWidth: 10 },
							MillingFormula: { cellWidth: 26 },
							MillingArea: { halign: 'center', cellWidth: 10 },
							// acuMillingFormula: { cellWidth: 16 },
							acuMillingArea: { halign: 'center', cellWidth: 10 },
							marker: { halign: 'center', cellWidth: 10 }
						},
						startY: this.pdfSetting.lineHeight * 2 + 25,
						rowPageBreak: 'avoid'
					});

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
							didDrawCell: (data) => {
								if(data.cell.section === 'body') {
									// console.log(data);
									this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
								}
							},
							startY: this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0),
							pageBreak: 'avoid'
						});
					}
				}

				await this.createPdf_footer();
				resolve();
			});
		},
		async createPdf_FA(OrderSN) {
			return new Promise(async (resolve, reject) => {
				const pageSize = 4;

				// PDF排版
				const splitTable = this.caseSpec.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header(OrderSN);

					this.pdfDoc.autoTable({ 
						head: [[ 
							'順序', '道管編號', '維修地點',
							{ content: '日期項目', colSpan: 2 },
							{ content: '安全設施', colSpan: 2 }, 
							'工程概述', '補繪標線'
						]],
						body: table.map((l, i) => {
							const dateTitles = [ '案件逾期日', '主任分派日', '預計進場日', '實際完工日' ];
							const dateContents = [ 'DateDeadline', 'DatePlan' ]
							const safeTitles = [ '安全錐', '鐵板', '警示燈', '連桿' ]; 

							let rowArr = [];
							for(let j = 0; j < 4; j++) {
								let rowSpan = j == 0 ? 4 : 1;
								rowArr.push({ 
									order: { rowSpan, content: (i+1) + pageSize*pageIndex }, 
									// DatePlan: l.DatePlan, 
									CaseNo: { rowSpan, content: `${l.CaseNo}\n${l.CaseSN}` }, 
									Place: { rowSpan, content: `${l.Postal_vil}\n${l.Place}` },
									dateTitle: { content: dateTitles[j] },
									dateContent: { content: dateContents[j] != undefined ? l[dateContents[j]] : "" },
									safeTitle: { content: safeTitles[j] },
									Notes: { rowSpan, content: l.Notes },
									Marker:  { rowSpan, content: "" }
								})
							}
							return rowArr;
						}).flat(),
						columns: [
							{ header: '順序', dataKey: 'order' },
							// { header: '主任分派日', dataKey: 'DatePlan' },
							{ header: '道管編號', dataKey: 'CaseNo' },
							{ header: '維修地點', dataKey: 'Place' },
							{ header: '日期項目1', dataKey: 'dateTitle' },
							{ header: '日期項目2', dataKey: 'dateContent' },
							{ header: '安全設施1', dataKey: 'safeTitle' },
							{ header: '安全設施2', dataKey: 'safeContent' },
							{ header: '工程概述', dataKey: 'Notes' },
							{ header: '補繪標線', dataKey: 'Marker' }
						],
						styles: { font: "edukai", valign: 'middle', fontSize: 9, cellPadding: { top: 1, right: 0.8, bottom: 1, left: 0.8 }, lineWidth: 0.2 },
						headStyles: { halign: 'center' },
						columnStyles: {
							order: { halign: 'center', cellWidth: 6 },
							CaseNo: { halign: 'center', cellWidth: 26 },
							Place: { cellWidth: 26, minCellHeight: 18 },
							dateTitle: { halign: 'center', cellWidth: 18 },
							dateContent: { halign: 'center', cellWidth: 20 },
							safeTitle: { halign: 'center', cellWidth: 12 },
							safeContent: { halign: 'center', cellWidth: 10 },
							Marker: { halign: 'center', cellWidth: 10 }
						},
						startY: this.pdfSetting.lineHeight * 2 + 25,
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

					for(const [ imgIndex, imgTable ] of splitImgTable.entries()) {
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
							didDrawCell: (data) => {
								if(data.cell.section === 'body') {
									// console.log(data);
									this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
								}
							},
							startY: this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0),
							pageBreak: 'avoid'
						});
					}
				}

				await this.createPdf_footer();
				resolve();
			});
		},
		async createPdf_MK(OrderSN) {
			return new Promise(async (resolve, reject) => {
				const pageSize = 6;

				// PDF排版
				const splitTable = this.caseSpec.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header(OrderSN);

					this.pdfDoc.autoTable({ 
						// head: [[ '順序', '主任分派日期', '道管編號', '損壞類別', '維修地點', '算式', '面積', '深度', '頓數' ]],
						body: table.map((l, i) => ({ 
							order: (i+1) + pageSize*pageIndex, 
							// DatePlan: l.DatePlan, 
							CaseNo: `${l.CaseNo}\n${l.CaseSN}`, 
							Place: `${l.Postal_vil}\n${l.Place}`,
							Note: l.IsCancel && l.IsCancel == 1 ? "不需施作" : "",
							areaSUM: ""
						})),
						columns: [
							{ header: '順序', dataKey: 'order' },
							// { header: '主任分派日', dataKey: 'DatePlan' },
							{ header: '道管編號', dataKey: 'CaseNo' },
							{ header: '維修地點', dataKey: 'Place' },
							{ header: '標線完成數量', dataKey: 'Note' },
							{ header: '總面積', dataKey: 'areaSUM' }
						],
						styles: { font: "edukai", valign: 'middle', fontSize: 9, cellPadding: { top: 1, right: 0.8, bottom: 1, left: 0.8 }, lineWidth: 0.2 },
						headStyles: { halign: 'center' },
						columnStyles: {
							order: { halign: 'center', cellWidth: 6 },
							CaseNo: { halign: 'center', cellWidth: 26 },
							Place: { cellWidth: 26, minCellHeight: 18 },
							areaSUM: { halign: 'center', cellWidth: 12 }
						},
						startY: this.pdfSetting.lineHeight * 2 + 25,
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
							didDrawCell: (data) => {
								if(data.cell.section === 'body') {
									// console.log(data);
									this.pdfDoc.addImage(this.imgDOMObj[data.cell.raw], 'JPEG', data.cell.x, data.cell.y, 45, 45);
								}
							},
							startY: this.pdfDoc.lastAutoTable.finalY + 8 * Number(imgIndex == 0),
							pageBreak: 'avoid'
						});
					}
				}

				await this.createPdf_footer();
				resolve();
			});
		},
		editJobTicketAmt(row) {
			this.$confirm(`確認修改 派工單號${row.OrderSN} 的金額為 ${row.Amount} ?`, "確認", { showClose: false })
				.then(() => {
					setJobTicketAmt({
						orderSN: row.OrderSN,
						amount: Number(row.Amount)
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "修改成功",
								type: "success",
							});
						} else {
							this.$message({
								message: "修改失敗",
								type: "error",
							});
						}
						this.getList();
					}).catch(err => {
						console.log(err);
						this.getList();
					});
				}).catch(err => {});
		},
		editJobTicket(row) {
			this.$router.push({
				name: "jobTicketEdit",
				params: { deviceType: this.deviceTypeNow, contractor: this.contractorNow, orderSN: row.OrderSN },
			});
		},
		reissueJobTicket(row) {
			// console.log(row);
			getJobTicketSpec({
				dispatchSN: row.OrderSN,
				deviceType: this.listQuery.deviceType
			}).then(async(response) => {
				this.caseSpec = response.data.list;

				this.caseSpec.forEach((l, i) => {
					for (const col of ['MillingDepth', 'MillingLength', 'MillingWidth', 'MillingArea']) 
						if(Number(l[col])) l[col] = Math.round(l[col] * 1000) / 1000;
				});
				this.imgPreload();

				switch(this.deviceTypeNow) {
					case 1:
						this.caseSpec.forEach((l, i) => {
							l.tonne = Math.round(l.MillingArea*l.MillingDepth*0.01*2.25*10) / 10;
						});
						this.createPdf_AC(row.OrderSN).then(() => { this.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });
						break;
					case 2:
						this.createPdf_HR(row.OrderSN).then(() => { this.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
					case 3:
						this.caseSpec.forEach((l, i) => {
							l.DatePlan = this.formatDate(l.DatePlan);
							l.DateDeadline = (l.DateDeadline == null) ? "" : this.formatDate(l.DateDeadline);
						});
						this.createPdf_FA(row.OrderSN).then(() => { this.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
					case 4:
						this.createPdf_MK(row.OrderSN).then(() => { this.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
				}
			}).catch(err => this.loading = false);
		},
		// 退回
		beforeRemove(row, revokeType) {
			this.rowActive = JSON.parse(JSON.stringify(row)); 
			this.$set(this.rowActive, "revokeType", revokeType);
			if(revokeType == 1) this.$set(this.rowActive, "revokeReason", 1);

			this.showRevokeConfirm = true;
		},
		removeDispatch() {
			// revokeType(退回類型)- 1: 退回主任分派, 2: 退回廠商製作派工單"
			if(this.rowActive.revokeType == 1) this.rowActive.revokeReason = this.options.reasonType[this.rowActive.revokeReason];
			revokeDispatch({
				revokeType: this.rowActive.revokeType,
				revokeReason: this.rowActive.revokeReason,
				deviceType: this.deviceTypeNow,
				dispatchSN: this.rowActive.OrderSN
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "退回成功",
						type: "success",
					});
				} else {
					this.$message({
						message: "退回失敗",
						type: "error",
					});
				}
				this.getList(false);
				this.showRevokeConfirm = false;
			}).catch(err => {
				console.log(err);
				this.getList(false);
				this.showRevokeConfirm = false;
			});
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
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
				&.tender-select
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
		.success-row 
			background: #F0F9EB
			&.hover-row > td
				background-color: initial !important
		.btn-action
			margin-left: 5px
			padding: 5px
	.btn-dialog
		padding: 5px 5px
</style>