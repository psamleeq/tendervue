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

			<!-- <span class="filter-item">
				<div style="font-size: 12px; color: #909399">分派日期</div>
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
					<el-select v-model="listQuery.tenderId" class="tender-select" placeholder="請選擇" popper-class="type-select tender" clearable @clear="listQuery.tenderId = null">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
				
				<el-input v-else v-model="listQuery.filterStr" placeholder="請輸入" style="width: 300px">
					<el-select slot="prepend" v-model="listQuery.filterType" popper-class="type-select">
						<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
				</el-input>
			</div>

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> --> 
		</div>

		<!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

		<h3>已選取案件</h3>
		<el-table
			ref="selectTable"
			empty-text="目前沒有資料"
			:data="tableSelect"
			:key="`selectCase_${deviceTypeNow}`"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
		>
			<el-table-column label="順序" width="60" align="center" fixed>
				<template slot-scope="{ row }">
					<el-select v-model="row.OrderIndexNew" placeholder="請選擇" size="mini" :disabled="tableSelect.length <= 1" @change="changeOrder(row)">
						<el-option v-for="index in Array.from({ length: tableSelect.length }, (_, i) => i+1 ).filter(i => i != row.OrderIndex)" :key="`order_${index}`" :label="index" :value="index" />
					</el-select>
				</template>
			</el-table-column>

			<el-table-column prop="index" width="60" align="center" fixed>
				<template slot="header">
					<span v-if="tableSelect.length == 0"> - </span>
					<el-checkbox v-else v-model="checkAll" :indeterminate="indeterminate" :disabled="list.length == 0 || tableSelect.length == 0" :key="`checkAll_${checkAll}`"/>
				</template>
				<template slot-scope="{ row }">
					<el-checkbox v-model="checkList[row.index-1]" :key="`list_${row.index}`" style="margin-right: 5px" @change="cellCheckBox(row)" />
					<span>{{ row.index }}</span>
				</template>
			</el-table-column>

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
					<span v-else-if="[ 'IsPressing' ].includes(column.property)">
						<i v-if="row.IsPressing == 1" class="el-icon-check" style="color: #67C23A; font-weight: bold;" />
						<span v-else> - </span>
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
			
			<el-table-column label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
						<el-button v-if="deviceTypeNow == 3" size="mini" @click="toggleExpand(row, 'selectTable')">詳情</el-button>
						<!-- <el-button v-if="deviceTypeNow == 3" type="success" size="mini" @click="beforeEdit(row)">設計</el-button> -->
						<el-button type="info" size="mini" @click="showDetail(row)">檢視</el-button>
					</el-button-group>
				</template>
			</el-table-column>

			<el-table-column type="expand" width="1" align="center" style="display: none">
				<template slot-scope="{ row }">
					<span v-if="row.Content.length == 0">目前沒有資料</span>
					<span v-else>
						<el-table
							class="expandTable"
							empty-text="目前沒有資料"
							:data="row.Content"
							border
							fit
							highlight-current-row
							:header-cell-style="{ 'background-color': '#F2F6FC' }"
							stripe
							show-summary
							:summary-method="(param) => getSummaries(param, row)"
							style="width: 100%"
						>
							<el-table-column type="index" label="序號" width="50" align="center" /> 
							<el-table-column
								v-for="(value, key) in detailHeaders"
								:key="key"
								:prop="key"
								:min-width="['itemName'].includes(key) ? 100 : ['itemId', 'unit', 'uPrice'].includes(key) ? 18 : 30"
								:label="value.name"
								align="center"
								:sortable="value.sortable"
							/>
						</el-table>
						<div class="expand-note">
							<!-- <div>金額合計: ${{ detailAmount(row.Content).toLocaleString() || "-" }}</div> -->
							<div>施作數量: {{ row.KitNotes.DesignDetail || "-" }}</div>
							<div>施工方式: {{ row.KitNotes.DesignDesc || "-" }}</div>
							<div>施作人力: {{ row.KitNotes.DesignWorker || "-" }}</div>
						</div>
					</span>
				</template>
			</el-table-column>
		</el-table>

		<br>

		<div class="previewPdf filter-container">
			<!-- <div v-if="deviceTypeNow == 3" class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>分派廠商</span>
					</div>
					<el-select v-model.number="contractorNow" placeholder="請選擇" popper-class="type-select" style="width: 100px" :disabled="tableSelect.length == 0">
						<el-option v-for="(name, id) in options.guildMap" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div> -->

			<el-tooltip class="filter-item" effect="dark" content="請選擇案件" placement="bottom" :disabled="tableSelect.length != 0">
				<div>
					<el-button type="success" icon="el-icon-s-claim" :disabled="tableSelect.length == 0" @click="previewPdf()">預覽派工單</el-button>
				</div>
			</el-tooltip>
		</div>

		<el-divider />

		<h3>主任分派案件</h3>
		<el-table
			ref="confirmTable"
			empty-text="目前沒有資料"
			:data="listFilter"
			:key="`allCase_${deviceTypeNow}`"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
			@selection-change="handleCheckedChange"
		>
			<el-table-column width="60" align="center" fixed>
				<template slot="header">
					<span v-if="listFilter.length == 0"> - </span>
					<el-checkbox v-else v-model="checkAll" :indeterminate="indeterminate" :key="`checkAll_${checkAll}`" :disabled="list.length == 0 || listFilter.length == 0" />
				</template>
				<template slot-scope="{ row }">
					<el-checkbox v-model="checkList[row.index-1]" :key="`list_${row.index}`" style="margin-right: 5px" @change="cellCheckBox(row)" />
					<span>{{ row.index }}</span>
				</template>
			</el-table-column>
			<!-- <el-table-column type="index" label="序號" width="50" align="center" /> -->
			<el-table-column label="退回" width="60" align="center" fixed>
				<template slot-scope="{ row }">
					<span v-if="deviceTypeNow == 4"> - </span>
					<el-button v-else type="danger" size="mini" style="padding: 5px" @click="removeDispatch(row)">退回</el-button>
				</template>
			</el-table-column>
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
					<span v-else-if="[ 'IsPressing' ].includes(column.property)">
						<i v-if="row.IsPressing == 1" class="el-icon-check" style="color: #67C23A; font-weight: bold;" />
						<span v-else> - </span>
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
			
			<el-table-column label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
						<el-button v-if="deviceTypeNow == 3" size="mini" @click="toggleExpand(row, 'confirmTable')">詳情</el-button>
						<!-- <el-button v-if="deviceTypeNow == 3" type="success" size="mini" @click="beforeEdit(row)">設計</el-button> -->
						<el-button type="info" size="mini" @click="showDetail(row)">檢視</el-button>
					</el-button-group>
				</template>
			</el-table-column>

			<el-table-column type="expand" width="1" align="center" style="display: none">
				<template slot-scope="{ row }">
					<span v-if="row.Content.length == 0">目前沒有資料</span>
					<span v-else>
						<el-table
							class="expandTable"
							empty-text="目前沒有資料"
							:data="row.Content"
							border
							fit
							highlight-current-row
							:header-cell-style="{ 'background-color': '#F2F6FC' }"
							stripe
							show-summary
							:summary-method="(param) => getSummaries(param, row)"
							style="width: 100%"
						>
							<el-table-column type="index" label="序號" width="50" align="center" /> 
							<el-table-column
								v-for="(value, key) in detailHeaders"
								:key="key"
								:prop="key"
								:min-width="['itemName'].includes(key) ? 100 : ['itemId', 'unit', 'uPrice'].includes(key) ? 18 : 30"
								:label="value.name"
								align="center"
								:sortable="value.sortable"
							/>
						</el-table>
						<div class="expand-note">
							<!-- <div>金額合計: ${{ detailAmount(row.Content).toLocaleString() || "-" }}</div> -->
							<div>施作數量: {{ row.KitNotes.DesignDetail || "-" }}</div>
							<div>施工方式: {{ row.KitNotes.DesignDesc || "-" }}</div>
							<div>施作人力: {{ row.KitNotes.DesignWorker || "-" }}</div>
						</div>
					</span>
				</template>
			</el-table-column>
		</el-table>

		<!-- <pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" /> -->

		<!-- Dialog: 案件檢視 -->
		<el-dialog width="500px" title="案件檢視" :visible.sync="showDetailDialog">
			<case-detail ref="caseDetail" :loading.sync="loading" :showDetailDialog.sync="showDetailDialog" :deviceTypeNow="deviceTypeNow" />
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
import { generate } from '@pdfme/generator';
import { Viewer, BLANK_PDF } from '@pdfme/ui';
import { getTenderMap, getGuildMap } from "@/api/type";
import { getJobTicket, confirmJobTicket, revokeDispatch, getTaskReal } from "@/api/dispatch";
// import TimePicker from "@/components/TimePicker";
import CaseDetail from "@/components/CaseDetail";
// import Pagination from "@/components/Pagination";

export default {
	name: "jobTicket",
	components: { CaseDetail },
	data() {
		return {
			loading: false,
			showJobTicket: true,
			showDetailDialog: true,
			screenWidth: window.innerWidth,
			searchRange: "",
			deviceTypeNow: 1,
			contractorNow: 0,
			listQuery: {
				filterType: 1,
				filterStr: null,
				tenderId: null,
				deviceType: 1,
				contractor: null,
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
				// Contractor: {
				// 	name: "廠商",
				// 	sortable: false
				// },
				Place: {
					name: "案件地點",
					sortable: false
				},
				DatePlan: {
					name: "主任分派日",
					sortable: false
				},
				// DateClose_AC: {
				// 	name: "銑鋪完工日",
				// 	sortable: false,
				// 	deviceTypeFilter: [4]
				// },
				// DateDeadline: {
				// 	name: "預計完工日期",
				// 	sortable: false
				// },
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
					deviceTypeFilter: [ 1 ]
				},
				tonne: {
					name: "噸數",
					sortable: false,
					deviceTypeFilter: [ 1 ]
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
			detailHeaders: {
				UnitSN: {
					name: "項次",
					sortable: false,
				},
				TaskName: {
					name: "工程項目名稱",
					sortable: false,
				},
				TaskUnit: {
					name: "單位",
					sortable: false,
				},
				TaskPrice: {
					name: "單價",
					sortable: false,
				},
				number: {
					name: "數量",
					sortable: false,
				}
			},
			// total: 0,
			list: [],
			detail: [],
			checkIndeterminate: false,
			checkList: [],
			tableSelect: [],
			apiHeader: [ "SerialNo", "OrderIndex" ],
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
			},
			pdfSetting: {
				fontSize: 14,
				lineHeight: (14 + 2) * 0.35
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
		listFilter() {
			const SNFilter = this.tableSelect.map(row => row.SerialNo);
			return this.list.filter(row => !SNFilter.includes(row.SerialNo));
		},
		checkAll: {
			get() {
				return this.list.length > 0 && this.tableSelect.length == this.list.length;
			},
			set(newVal) {
				if(newVal) this.tableSelect = this.list;
				else this.tableSelect = [];

				this.checkList = this.checkList.map(() => newVal);
				this.resetOrder();
			}
		},
		indeterminate() {
			return this.tableSelect.length > 0 && this.tableSelect.length < this.list.length;
		},
	},
	watch: { 
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
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
		this.showDetailDialog = false;
	},
	methods: {
		async handleCheckedChange(val) {
			this.tableSelect = val;
			if(this.tableSelect.length == this.list.length) this.tableSelect.forEach((_, index) => this.$set(this.checkList, index, true));
			if(this.tableSelect.length == 0) this.checkList = this.checkList.map(() => false);

			this.resetOrder();
		},
		cellCheckBox(row) {
			// if(this.checkList[row.index-1]) this.$refs.confirmTable.toggleRowSelection(row, true);
			// else this.$refs.confirmTable.toggleRowSelection(row, false);
			if(this.checkList[row.index-1]) this.tableSelect.push(row);
			else this.tableSelect = this.tableSelect.filter(selectRow => selectRow.index != row.index);

			this.resetOrder();
		},
		toggleExpand(row, tableName) {
			this.getTaskDetail(row).then(() => { 
				this.$refs[tableName].toggleRowExpansion(row);

				// 調整總計列欄位
				this.$nextTick(() => {
					// const expandTableSummary = document.querySelectorAll("#expandTable .el-table__footer-wrapper tr>td");
					const expandTableSumList = document.querySelectorAll(".expandTable .el-table__footer-wrapper tr");
					// console.log(expandTableSumList);
					if(expandTableSumList.length != 0) {
						for(const tableList of expandTableSumList) {
							// console.log(tableList);
							const tdList = tableList.getElementsByTagName("td");
							if(tdList.length != 0) {
								tdList[0].colSpan = 4;
								tdList[0].style.textAlign = "center";
								tdList[1].style.display = "none";
								tdList[2].style.display = "none";
								tdList[3].style.display = "none";
								tdList[4].colSpan = 2;
								tdList[4].style.textAlign = "center";
								tdList[5].style.display = "none";
							}
						}
					}
				});
			}).catch(err => this.loading = false);
		},
		changeOrder(row) {
			this.tableSelect.splice(row.OrderIndex - 1, 1);
			this.tableSelect.splice(row.OrderIndexNew - 1, 0, row);
			this.resetOrder();
		},
		resetOrder() {
			for(const [ index, row ] of this.tableSelect.entries()) row.OrderIndex = row.OrderIndexNew = index + 1;
		},
		imgPreload() {
			//img preload
			this.imgDOMObj = {};
			this.list.forEach(l => { 
				let image = new Image();
				image.src = l.ImgZoomOut;
				this.imgDOMObj [l.CaseNo] = image;
			});
		},
		detailAmount(content) {
			return content.reduce((acc, cur) => (acc+=cur.number*Number(cur.TaskPrice)), 0)
		},
		getSummaries(param, row) {
			const { columns, data } = param;
			const sums = [];
			columns.forEach((column, index) => {
				if (index === 0) {
					sums[index] = `金額合計`;
					return;
				}
				if(![1,2].includes(index)) {
					if(column.property == "TaskPrice") sums[index] = this.detailAmount(row.Content).toLocaleString();
				}
			});
			return sums;
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
				this.tableSelect = [];
				
				getJobTicket({
					contractor: this.listQuery.contractor,
					tenderId: this.listQuery.filterType == 1 ? this.listQuery.tenderId : null,
					reportSN: (this.listQuery.filterType == 2 && this.listQuery.filterStr) ? this.listQuery.filterStr : null,
					keywords: (this.listQuery.filterType == 3 && this.listQuery.filterStr) ? this.listQuery.filterStr : null,
					deviceType: this.listQuery.deviceType
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
						this.contractorNow = this.listQuery.contractor;

						this.list.forEach((l, i) => {
							l.Contractor = this.options.guildMap[l.Contractor];
							l.DatePlan = this.formatDate(l.DatePlan);
							// l.DateClose_AC = this.formatDate(l.DateClose_AC);
							// this.$set(l, "detailTime", false);
							// l.DateDeadline = (l.DateDeadline == null) ? moment(Number(String(l.CaseNo).substr(0, 7))+19110000, "YYYYMMDD", true).add(15, 'd').format("YYYY-MM-DD") : this.formatDate(l.DateDeadline);
							l.DateDeadline = (l.DateDeadline == null) ? "" : this.formatDate(l.DateDeadline);
							for (const col of ['MillingDepth', 'MillingLength', 'MillingWidth', 'MillingArea']) 
								if(Number(l[col])) l[col] = Math.round(l[col] * 1000) / 1000;
							this.$set(l, "index", i+1);
							this.$set(l, "OrderIndex", i+1);
							this.$set(l, "OrderIndexNew", i+1);
							this.$set(l, "tonne", Math.round(l.MillingArea*l.MillingDepth*0.01*2.25*10) / 10);
						})

						this.imgPreload();
					}
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		getTaskDetail(row) {
			return new Promise(resolve => {
			row.Content = [];
				getTaskReal({ taskRealGroup: row.TaskRealGroup }).then(response => {
					row.Content = response.data.list;
					resolve();
				}).catch(err => this.loading = false);
			})
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
				switch(this.deviceTypeNow) {
					case 1:
						this.createPdf_AC().then(() => resolve());
						break;
					case 2:
						this.createPdf_HR().then(() => resolve());
						break;
					case 3:
						this.createPdf_FA().then(() => resolve());
						break;
					case 4:
						this.createPdf_MK().then(() => resolve());
						break;
				}
			});
		},
		async createPdf_header() {
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
				this.pdfDoc.text(`${today} 派工單號：           `, width - 15, this.pdfSetting.lineHeight + 25, { align: 'right' });
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
		async createPdf_AC() {
			return new Promise(async (resolve, reject) => {
				const pageSize = 8;

				// PDF排版
				let tonneSUM = 0;
				let areaSUM = 0;
				const splitTable = this.tableSelect.reduce((acc, cur) => {
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
					await this.createPdf_header();

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
		async createPdf_HR() {
			return new Promise(async (resolve, reject) => {
				const pageSize = 8;

				// PDF排版
				const splitTable = this.tableSelect.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header();

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
		async createPdf_FA() {
			return new Promise(async (resolve, reject) => {
				const pageSize = 4;

				// PDF排版
				const splitTable = this.tableSelect.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header();

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
		async createPdf_MK() {
			return new Promise(async (resolve, reject) => {
				const pageSize = 6;

				// PDF排版
				const splitTable = this.tableSelect.reduce((acc, cur) => {
					if(acc[acc.length-1].length < pageSize) acc[acc.length-1].push(cur);
					else acc.push([cur]);
					return acc;
				}, [[]]);

				for(const [ pageIndex, table ] of splitTable.entries()) {
					this.pdfDoc.addPage();
					while(pageIndex == 0 && this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
					await this.createPdf_header();

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
		previewPdf() {
			this.loading = true;
			this.createPdf().then(() => {
				const schemas = Array.from({ length: this.pdfDoc.internal.getNumberOfPages() }, () => (
					{
							"OrderSN": {
								"type": "text",
								"position": {
									"x": 167.64,
									"y": 26
								},
								"width": 27.24,
								"height": 6.12,
								"fontSize": 14,
								"alignment": "center"
							}
						}
				));

				this.viewer.updateTemplate({ basePdf: this.pdfDoc.output('bloburl'), schemas });
				this.viewer.setInputs([{ "OrderSN": "(預覽列印)" }]);

				this.loading = false;
				this.showJobTicket = true;
			})
		},
		caseFilterList(list) {
			// console.log(list);
			let caseFilterList = [];
			for(const row of list) {
				let caseItem = {};
				for(const key of this.apiHeader) caseItem[key] = row[key];
				caseFilterList.push(caseItem);
			}

			return caseFilterList;
		},
		downloadPdf() {
			this.$confirm(`確認將 案件編號${ this.tableSelect.map(caseSpec => caseSpec.CaseNo).join("、") } 製作派工單？`, "確認", { showClose: false })
				.then(() => {
					confirmJobTicket({
						contractor: this.contractorNow,
						deviceType: this.deviceTypeNow,
						caseList: this.caseFilterList(this.tableSelect)
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							const orderSN = response.data.orderSN;
							this.$message({
								message: `製作成功(派工單號 ${orderSN})`,
								type: "success",
							});
							this.viewer.setInputs([{ "OrderSN": String(orderSN) }]);
							this.showJobTicket = false;
							this.handleDownload(`維修派工單_${orderSN}.pdf`);
							// this.pdfDoc.save(`維修派工單_${orderSN}.pdf`);
						} else {
							this.$message({
								message: "製作失敗",
								type: "error",
							});
						}
						this.getList();
					}).catch(err => {
						console.log(err);
						this.showJobTicket = false;
						this.getList();
					});
				}).catch(err => {});
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
		removeDispatch(row) {
			this.$confirm(`確認退回 案件編號${row.CaseNo}?`, "確認", { showClose: false })
				.then(() => {
					revokeDispatch({
						revokeType: this.deviceTypeNow == 4 ? 2 : 1,
						deviceType: this.deviceTypeNow,
						serialNo: row.SerialNo
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
						this.getList();
					}).catch(err => {
						console.log(err);
						this.getList();
					});
				}).catch(err => {});
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.job-ticket
	.el-select
		.el-input__inner
			padding-left: 3px
			padding-right: 10px
			text-align: center
		.el-input__suffix
			right: 0
			transform: scale(0.7)
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 110px
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
	.previewPdf
		display: flex
		justify-content: center
	.el-table
		.input-length, .input-width
			max-width: 60px
		.btn-tag
			cursor: pointer
		.el-table__expand-icon
			display: none
	.expand-note 
		padding: 10px 0 0 10px
		& > *
			font-size: 14px
			margin: 5px 0
	.btn-dialog
		padding: 5px 5px
</style>