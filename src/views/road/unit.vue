<template>
	<div class="app-container road-unit" v-loading="loading">
		<h2>道路單元</h2>
		<div class="filter-container">
			<el-cascader
				class="filter-item"
				v-model="listQuery.distList"
				placeholder="請選擇區域"
				:key="listQuery.distList.length"
				:options="districtOpt"
				:show-all-levels="false"
				:props="{ expandTrigger: 'hover', multiple: true, emitPath: false }"
				style="width: 340px"
			>
				<template slot-scope="{ node, data }">
					<span>{{ data.label }}</span>
					<span v-if="!node.isLeaf"> ({{ listQuery.distList.length }}) </span>
				</template>
			</el-cascader>
			<div class="filter-item">
				<el-tooltip effect="dark" content="不填為查詢全部" placement="bottom-end">
					<el-input
						v-model="listQuery.roadName"
						placeholder="請輸入道路名稱，多個以「,」分隔"
						style="width: 300px"
						@input="listQuery.roadName = listQuery.roadName.replace(/\s+/g, '')"
					/>
				</el-tooltip>
			</div>
			<!-- <time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/> -->

			<div class="filter-item">
				<el-tooltip effect="dark" content="填0為查詢全部" placement="bottom-end">
					<el-input
						v-model="listQuery.width"
						type="number"
						:min="0"
						placeholder="公尺"
						style="width: 180px"
						@blur="() => { if (listQuery.width < 0) listQuery.width = 0; }"
					>
						<el-select slot="prepend" v-model="listQuery.widthType">
							<el-option v-for="(name, type) in widthTypeMap" :key="type" :label="name" :value="Number(type)" />
						</el-select>
					</el-input>
				</el-tooltip>
			</div>

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
			<el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button>

			<div class="filter-item">
				<div class="el-input-group">
					<div class="el-input-group__prepend">
						<el-checkbox v-model="allHeaders" :indeterminate="partHeaders">欄位</el-checkbox>
					</div>
					<el-checkbox-group class="el-input__inner column-filter-item" v-model="headersCheckVal">
						<el-checkbox v-for="(value, key) in headersOpt" :key="key" :label="key">{{ value.name }}</el-checkbox>
					</el-checkbox-group>
				</div>
			</div>
		</div>

		<h4 v-if="list.length != 0">道路單元數：{{ total }}</h4>

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
				v-for="(value, key) in headersFilter"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:formatter="formatter"
				:sortable="value.sortable"
			/>
		</el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />
	</div>
</template>

<script>
import moment from "moment";
import { getRoadUnit } from "@/api/road";
// import TimePicker from "@/components/TimePicker";
import Pagination from "@/components/Pagination";

export default {
	name: "roadUnit",
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
				distList: [],
				roadName: "",
				widthType: 1,
				width: 0,
				widthReal: 0,
				pageCurrent: 1,
				pageSize: 20,
			},
			headersFixed: {
				RoadId: {
					name: "序號",
					sortable: false,
				},
				notes: {
					name: "單元編號",
					sortable: true,
				},
				dist: {
					name: "行政區",
					sortable: true,
				},
				roadName: {
					name: "道路名稱",
					sortable: true,
				},
			},
			headersOpt: {
				crossName: {
					name: "交叉道路名稱",
					sortable: false,
				},
				roadStart: {
					name: "起始道路名稱",
					sortable: false,
				},
				roadEnd: {
					name: "結束道路名稱",
					sortable: false,
				},
				lane: {
					name: "車道數",
					sortable: false,
				},
				width: {
					name: "計畫路寬",
					sortable: true,
				},
				widthReal: {
					name: "實際路寬",
					sortable: true,
				},
				length: {
					name: "區段長度",
					sortable: true,
				},
				area: {
					name: "道路面積",
					sortable: true,
				},
				areaCross: {
					name: "道路面積(扣除路口重覆)",
					sortable: true,
				},
			},
			total: 0,
			list: [],
			headersCheckVal: [],
			allHeaders: true,
			widthTypeMap: {
				1: "計畫路寬",
				2: "實際路寬",
			},
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
			// districtOpt: [
			// 	{
			// 		value: 0,
			// 		label: "台北市",
			// 		children: [
			// 			{
			// 				value: 100,
			// 				label: "中正區"
			// 			},
			// 			{
			// 				value: 103,
			// 				label: "大同區"
			// 			},
			// 			{
			// 				value: 104,
			// 				label: "中山區"
			// 			},
			// 			{
			// 				value: 105,
			// 				label: "松山區"
			// 			},
			// 			{
			// 				value: 106,
			// 				label: "大安區"
			// 			},
			// 			{
			// 				value: 108,
			// 				label: "萬華區"
			// 			},
			// 			{
			// 				value: 110,
			// 				label: "信義區"
			// 			},
			// 			{
			// 				value: 111,
			// 				label: "士林區"
			// 			},
			// 			{
			// 				value: 112,
			// 				label: "北投區"
			// 			},
			// 			{
			// 				value: 114,
			// 				label: "內湖區"
			// 			},
			// 			{
			// 				value: 115,
			// 				label: "南港區"
			// 			},
			// 			{
			// 				value: 116,
			// 				label: "文山區"
			// 			}
			// 		]
			// 	}
			// ]
		};
	},
	computed: {
		partHeaders() {
			return (this.headersCheckVal.length != 0 && this.headersCheckVal.length < Object.keys(this.headersOpt).length);
		},
		headersFilter() {
			if (this.headersCheckVal.length == 0) this.allHeaders = false;

			let headersFilter = Object.assign({}, this.headersFixed);
			this.headersCheckVal.forEach((header) => headersFilter[header] = this.headersOpt[header]);
			return headersFilter;
		},
		districtOpt() {
			let districtOpt = [{ value: 0, label: "台北市", children: [] }];
			for (const zip in this.districtList)
				districtOpt[0].children.push({
					value: Number(zip),
					label: this.districtList[zip].name,
				});

			return districtOpt;
		},
	},
	watch: {
		allHeaders(val) {
			if (val) this.headersCheckVal = Object.keys(this.headersOpt);
			else this.headersCheckVal = [];
		},
	},
	created() {
		this.listQuery.distList = Object.keys(this.districtList);
		if (this.allHeaders) this.headersCheckVal = Object.keys(this.headersOpt);
		else this.headersCheckVal = [];

		this.getList();
	},
	methods: {
		async getList() {
			this.loading = true;

			// let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
			// this.searchRange = startDate + " - " + endDate;

			this.list = [];
			let query = {
				// width: this.listQuery.width,
				// widthReal: this.listQuery.widthReal,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize,
				// timeStart: startDate,
				// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
			};
			if (this.listQuery.distList.length > 0) query.distList = this.listQuery.distList.join(",");
			if (this.listQuery.roadName.length > 0) query.roadName = this.listQuery.roadName;
			if (this.listQuery.widthType == 1) query.width = this.listQuery.width;
			else if (this.listQuery.widthType == 2) query.widthReal = this.listQuery.width;

			getRoadUnit(query).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.total = response.data.total;
					this.list = response.data.list;
					this.list.forEach(l => l.dist = this.districtList[l.zip].name);
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		indexMethod(index) {
			return (index + 1 + (this.listQuery.pageCurrent - 1) * this.listQuery.pageSize);
		},
		formatter(row, column) {
			if (Number(row[column.property])) return row[column.property].toLocaleString();
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