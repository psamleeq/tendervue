<template>
	<div class="app-container road-case" v-loading="loading">
		<h2>缺失列表</h2>
		<div class="filter-container">
			<el-select
				class="filter-item"
				v-model="listQuery.caseType"
				placeholder="請選擇缺失類型"
				multiple
				style="width: 500px"
			>
				<el-option v-for="type in options.caseType" :key="type" :label="type" :value="type" />
			</el-select>
			<div class="filter-item">
				<el-tooltip effect="dark" content="不填為查詢全部" placement="bottom-end">
					<el-input
						v-model="listQuery.caseId"
						placeholder="請輸入缺失編號"
						style="width: 150px"
					/>
				</el-tooltip>
			</div>
			<!-- <time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> -->
			<el-checkbox v-model="listQuery.filter" style="margin-left: 20px">已刪除</el-checkbox>
		</div>

		<!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

		<el-table
			empty-text="目前沒有資料"
			:data="list"
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
				:formatter="formatter"
				:sortable="value.sortable"
			/>
			<el-table-column label="狀態" align="center">
				<template slot-scope="{ row }">
					<i v-if="row.reccontrol == '1'" class="el-icon-check" style="color: #67C23A" />
					<span v-else-if="row.reccontrol == '8'">
						<i class="el-icon-close" style="color: #F56C6C" />
						<el-button type="success" plain size="mini" round @click="recoverCaseStatus(row)">復原</el-button>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center">
				<template slot-scope="{ row }">
					<el-button type="primary" plain size="mini" round @click="showMap(row)">地圖</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />
	</div>
</template>

<script>
import moment from "moment";
import { getRoadCaseType, getRoadCaseList, setRoadCase } from "@/api/road";
// import TimePicker from "@/components/TimePicker";
import Pagination from "@/components/Pagination";

export default {
	name: "roadCase",
	components: { Pagination },
	data() {
		return {
			loading: false,
			// timeTabId: moment().year(),
			// dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			// daterange: [
			// 	moment().month(5).startOf("month").toDate(),
			// 	moment().endOf("year").toDate(),
			// ],
			// searchRange: "",
			listQuery: {
				filter: false,
				caseType: [],
				caseId: null,
				pageCurrent: 1,
				pageSize: 20,
			},
			headers: {
				id: {
					name: "序號",
					sortable: true,
				},
				caseId: {
					name: "缺失編號",
					sortable: true,
				},
				caseName: {
					name: "缺失類型",
					sortable: true,
				},
				caseLevel: {
					name: "損壞程度",
					sortable: true,
				},
				roadName: {
					name: "道路名稱",
					sortable: true,
				},
				width: {
					name: "寬度(cm)",
					sortable: true,
				},
				depth: {
					name: "深度(cm)",
					sortable: true,
				},
				// reccontrol: {
				// 	name: "狀態",
				// 	sortable: false
				// }
			},
			total: 0,
			list: [],
			roadIdMap: {
				0: "路口",
				1: "順向",
				2: "逆向",
			},
			districtList: {
				100: {
					name: "中正區",
					engName: "Zhongzheng",
				},
				103: {
					name: "大同區",
					engName: "Datong",
				},
				104: {
					name: "中山區",
					engName: "Zhongshan",
				},
				105: {
					name: "松山區",
					engName: "Songshan",
				},
				106: {
					name: "大安區",
					engName: "Da’an",
				},
				108: {
					name: "萬華區",
					engName: "Wanhua",
				},
				110: {
					name: "信義區",
					engName: "Xinyi",
				},
				111: {
					name: "士林區",
					engName: "Shilin",
				},
				112: {
					name: "北投區",
					engName: "Beitou",
				},
				114: {
					name: "內湖區",
					engName: "Neihu",
				},
				115: {
					name: "南港區",
					engName: "Nangang",
				},
				116: {
					name: "文山區",
					engName: "Wenshan",
				},
			},
			options: {
				caseType: [],
				BrokeType: {
					1: "輕度",
					2: "中度",
					3: "重度"
				},
			}
		};
	},
	computed: {},
	watch: {},
	created() {
		getRoadCaseType().then(response => {
			this.listQuery.caseType = this.options.caseType = response.data.list;
			this.getList();
		});
		// this.listQuery.distList = Object.keys(this.districtList);
		
	},
	methods: {
		showMap(row) {
			this.$router.push({
				path: "/case/caseMap",
				query: { caseId: row.caseId },
			});
		},
		getList() {
			this.loading = true;

			// let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
			// this.searchRange = startDate + " - " + endDate;

			this.list = [];
			this.total = 0;

			getRoadCaseList({
				filter: this.listQuery.filter,
				caseType: this.listQuery.caseType.join(","),
				caseId: this.listQuery.caseId,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize,
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.total = response.data.total;
					this.list = response.data.list;
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		recoverCaseStatus(row) {
			// console.log(this.currCaseId);
			setRoadCase(row.caseId, { type: 1 }).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "修改成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		indexMethod(index) {
			return (index + 1 + (this.listQuery.pageCurrent - 1) * this.listQuery.pageSize);
		},
		formatter(row, column) {
			if (column.property.indexOf("id") == -1 && column.property.indexOf("Id") == -1 && Number(row[column.property])) return row[column.property].toLocaleString();
			else return row[column.property] || "-";
		},
		formatTime(time) {
			return moment(time).utc().format("YYYY-MM-DD");
		},
		async handleDownload() {
			// await this.dateWatcher();

			// const startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// const endDate = moment(this.daterange[1]).format("YYYY-MM-DD");

			let query = {
				pageCurrent: 1,
				pageSize: this.total,
				// timeStart: startDate,
				// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
			};
			if (this.listQuery.distList.length > 0) query.distList = this.listQuery.distList.join(",");
			if (this.listQuery.roadName.length > 0) query.roadName = this.listQuery.roadName;
			if (this.listQuery.widthType == 1) query.width = this.listQuery.width;
			else if (this.listQuery.widthType == 2) query.widthReal = this.listQuery.width;

			getRoadUnit(query).then((response) => {
				let list = response.data.list;
				list.forEach(l => l.dist = this.districtList[l.zip].name);

				const tHeader = Object.values(this.headersFilter).map((h) => h.name);
				const filterVal = Object.keys(this.headersFilter);
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
// *
// 	border: 1px solid #000
// 	box-sizing: border-box

.road-unit
	.filter-container
		.el-select
			width: 105px
		.el-input__inner
			padding-left: 5px
			text-align: center
		.filter-item
			margin-right: 5px
			input[type=number]
				padding: 0
				overflow: hidden
				&::-webkit-inner-spin-button
					transform: scale(1.2, 1) translateX(-11%)
			.el-input__inner.column-filter-item
				width: auto
				// max-width: 1200px
				text-align: left
				.el-checkbox
					margin: 0 4px 0 10px
</style>