<template>
	<div class="app-container case-plan" v-loading="loading">
		<h2>主任派工</h2>
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
				<div style="font-size: 12px; color: #909399">{{ listQuery.filter ? '派工日期' : '成案日期' }}</div>
				<time-picker shortcutType="day" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
			</span>
			<br />

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
			<el-checkbox v-model="listQuery.filter" style="margin-left: 20px">已派工</el-checkbox>
		</div>

		<h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5>

		<div v-if="!filterNow" class="filter-container">
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
			<el-tooltip effect="dark" content="請選擇廠商和案件" placement="bottom" :disabled="tableSelect.length != 0 && Number(listQuery.contractor) > 0">
				<span>
					<el-button class="filter-item" type="success" icon="el-icon-s-claim" :disabled="tableSelect.length == 0 || Number(listQuery.contractor) == 0" @click="dispatch()">分派</el-button>
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
			<el-table-column v-if="!filterNow" :key="filterNow" type="selection" width="60" align="center" fixed>
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

			<el-table-column v-if="filterNow" :key="filterNow" prop="Contractor" label="廠商" width="90" align="center" fixed />

			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:width="['DateDeadline'].includes(key) ? 220 : null"
				:min-width="['Place'].includes(key) ? 80 : null"
				:sortable="value.sortable"
			>
				<!-- <template slot-scope="{ row, column }">
					<span v-if="[ 'DateDeadline' ].includes(column.property)">
						<el-row type="flex" align="middle">
							<el-col :span="18"><el-date-picker v-model="row.DateDeadline" type="date" value-format="yyyy-MM-dd" placeholder="選擇日期" style="width: 100%" /></el-col>
							<el-col :span="6"><el-tag class="btn-tag" :type="row.detailTime ? 'success': 'info'" @click="row.detailTime = !row.detailTime">時段</el-tag></el-col>
						</el-row>
						<el-time-picker v-if="row.detailTime" v-model="row.estWorkingTime" is-range range-separator="至"  start-placeholder="開始時間" end-placeholder="結束時間" placeholder="選擇時間" style="width: 100%" />
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template> -->
			</el-table-column>

			<!-- 道路、熱再生 -->
			<el-table-column v-if="[1,2].includes(deviceTypeNow)" label="算式" :width="filterNow ? 240 : 500" align="center">
				<template slot-scope="{ row }">
					<span v-if="!filterNow">
						<el-row v-if="row.editFormula" :gutter="5" type="flex" align="middle">
							<el-col :span="4"><el-tag class="btn-tag" type="success" @click="row.editFormula = false; calArea(row);">自訂</el-tag></el-col>
							<el-col :span="20"><el-input v-model="row.MillingFormula" @change="calArea(row)" /></el-col>
						</el-row>
						<el-row v-else :gutter="5" type="flex" align="middle">
							<el-col :span="4"><el-tag class="btn-tag" @click="row.editFormula = true; calArea(row);">簡單</el-tag></el-col>
							<el-col :span="8"><el-input v-model="row.MillingLength" @change="calArea(row)" /></el-col>
							<el-col :span="2" style="line-height: 36px"> ✕ </el-col>
							<el-col :span="8"><el-input v-model="row.MillingWidth" @change="calArea(row)" /></el-col>
						</el-row>
					</span>
					<span v-else>
						<span v-if="row.MillingFormula != '0'">{{ row.MillingFormula }}</span>
						<span v-else>{{ row.MillingLength }} * {{ row.MillingWidth }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column v-if="[1,2].includes(deviceTypeNow)" label="預估面積" width="85" align="center">
				<template slot-scope="{ row }">
					<!-- <el-input v-model="row.MillingArea" /> -->
					<span>{{ row.MillingArea || "-" }}</span>
				</template>
			</el-table-column>

			<!-- 設施 -->
			<el-table-column v-if="deviceTypeNow == 3" label="急件" width="55" align="center">
				<template slot-scope="{ row }">
					<el-checkbox v-model="row.isPressing" />
				</template>
			</el-table-column>
			<el-table-column v-if="deviceTypeNow == 3" label="工程概述" align="center">
				<template slot-scope="{ row }">
					<el-input v-model="row.Notes" />
				</template>
			</el-table-column>

			<el-table-column :label="filterNow ? '主任派工日期' : '是否退件'" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.IsReturn"> 前ㄧ分派時間: </span>
					<span>{{ row.DatePlan || "-" }}</span>
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
			<case-detail ref="caseDetail" :loading.sync="loading" :showDetailDialog.sync="showDetailDialog" :deviceTypeNow="deviceTypeNow" />
			<div slot="footer" class="dialog-footer">
				<!-- <el-button @click="showDispatch = false">取消</el-button> -->
				<el-button type="primary" @click="showDetailDialog = false">確定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderMap, getGuildMap } from "@/api/type";
import { getDispatchList, setDispatchList } from "@/api/dispatch";
import TimePicker from "@/components/TimePicker";
import CaseDetail from "@/components/CaseDetail";
// import Pagination from "@/components/Pagination";

export default {
	name: "caseAssign",
	components: { TimePicker, CaseDetail },
	data() {
		return {
			loading: false,
			showDispatch: false,
			showDetailDialog: true,
			showEdit: false,
			timeTabId: 1,
			dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			daterange: [
				moment().subtract(1, 'd').startOf("day").toDate(),
				moment().subtract(1, 'd').endOf("day").toDate(),
			],
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
				// CaseSN: {
				// 	name: "申請單號",
				// 	sortable: true,
				// },
				// CaseNo: {
				// 	name: "案件編號",
				// 	sortable: true,
				// },
				// casetype: {
				// 	name: "查報來源",
				// 	sortable: false,
				// },
				// DName: {
				// 	name: "案件類型",
				// 	sortable: false,
				// },
				Place: {
					name: "案件地點",
					sortable: false
				},
				// DateDeadline: {
				// 	name: "預計完工日期",
				// 	sortable: false
				// },
				// estWorkingTime: {
				// 	name: "預計施作時段",
				// 	sortable: false
				// },
				// MillingFormula: {
				// 	name: "複雜算式",
				// 	sortable: false
				// },
				// MillingLength: {
				// 	name: "預計長度",
				// 	sortable: false
				// },
				// MillingWidth: {
				// 	name: "預計寬度",
				// 	sortable: false
				// },
				// MillingArea: {
				// 	name: "預估面積",
				// 	sortable: false
				// },
			},
			// total: 0,
			list: [],
			detail: [],
			checkIndeterminate: false,
			checkList: [],
			tableSelect: [],
			apiHeader: [ "SerialNo", "MillingLength", "MillingWidth", "MillingDepth", "MillingFormula", "MillingArea" ],
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
	computed: {	},
	watch: { },
	created() { 
		getTenderMap().then(response => { this.options.tenderMap = response.data.tenderMap });
		getGuildMap().then(response => { this.options.guildMap = response.data.guildMap });
	},
	mounted() {
		this.showDetailDialog = false;
	},
	methods: {
		async handleCheckedChange(val) {
			// const delay = (n) => new Promise( r => setTimeout(r, n*1000));

			// for(const val of value) {
			// 	let msgArr = [];
			// 	for(const column in this.headers) {
			// 		if(!['CaseNo', 'organAssign'].includes(column) && !val[column]) msgArr.push(`「${this.headers[column].name}」`);
			// 	}
			// 	if(msgArr.length > 0) {
			// 		this.$message({
			// 			type: "warning",
			// 			message: `請填入${val.UploadCaseNo}的${msgArr.join("、")}`
			// 		});

			// 		await delay(0.5);
			// 	}
			// }

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
		getList() {
			this.loading = true;
			this.list = [];
			this.tableSelect = [];

			let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
			this.searchRange = startDate + " - " + endDate;

			getDispatchList({
				filter: this.listQuery.filter,
				tenderId: this.listQuery.filterType == 1 ? this.listQuery.tenderId : null,
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
					this.filterNow = this.listQuery.filter;
					this.listQuery.contractor = null;

					this.list.forEach(l => {
						l.Contractor = this.options.guildMap[l.Contractor];
						l.DatePlan = this.formatTime(l.DatePlan);
						l.DateDeadline = this.formatTime(l.DateDeadline);
						this.$set(l, "detailTime", false);
						this.$set(l, "editFormula", l.MillingFormula != '0');
					// 	this.$set(l, "editNote", false);
					})
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		calArea(row) {
			const replaceObj = { " ": "", "m": "", "M": "", "=": "", "＝": "", "＋": "+", "－": "-", "＊": "*", "x": "*", "X": "*", "×": "*", "／": "/", "（": "(", "）": ")",
			"０": '0', "１": "1", "２": "2", "３": "3", "４": "4", "５": "5", "６": "6", "７": "7", "８": "8", "９": "9" };
			
			if(row.editFormula) {
				for(const key in replaceObj) row.MillingFormula = row.MillingFormula.replaceAll(key, replaceObj[key]);
				row.MillingArea = Math.round(new Function(`return ${row.MillingFormula}`)() * 100) / 100;
			} else row.MillingArea = row.MillingLength * row.MillingWidth;
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
		dispatch() {
			this.$confirm(`確認將 案件編號${ this.tableSelect.map(caseSpec => caseSpec.CaseNo).join("、") } 分派給 ${ this.options.guildMap[this.listQuery.contractor] }?`, "確認", { showClose: false })
				.then(() => {
					this.loading = true;
					this.tableSelect.forEach(row => this.calArea(row));

					setDispatchList({
						contractor: this.listQuery.contractor,
						deviceType: this.listQuery.deviceType,
						caseList: this.caseFilterList(this.tableSelect)
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "建立成功",
								type: "success",
							});

							this.getList();
						} 
					}).catch(err => {
						console.log(err);
						this.getList();
					})
				}).catch(err => {});
		},
		showDetail(row) {
			this.loading = true;
			this.$refs.caseDetail.getDetail(row);
		},
		formatTime(time) {
			const m = moment(time);
			return m.isValid() ? m.format("YYYY/MM/DD") : "" ;
		}
	},
};
</script>

<style lang="sass">
*
	// border: 1px solid #000
	// box-sizing: border-box
.case-plan
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
		.input-length, .input-width
			max-width: 60px
		.btn-tag
			cursor: pointer
		.el-table__expand-icon
			display: none
	.btn-dialog
		padding: 5px 5px
</style>