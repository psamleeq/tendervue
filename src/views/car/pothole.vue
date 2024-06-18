<template>
	<div class="app-container inspection-progress" v-loading="loading">
		<h2>坑洞缺失</h2>
		<!-- 搜尋 -->
		<div class="filter-container">
			<el-select v-model="listQuery.contractId" placeholder="請選擇" style="width: 110px;">
        <el-option label="全部" :value="99" />
				<el-option v-for="(text, id) in team" :key="`contractId${id}`" :label="text" :value="Number(id)" />
			</el-select>

			<!-- <span class="time-picker" style="margin-left: 10px;"> -->
				<!-- <el-button-group v-if="!dateTimePickerVisible">
					<el-button
						v-for="(t, i) in pickerOptions.shortcuts"
						:key="i"
						type="primary"
						:plain="i != timeTabId"
						size="mini"
						@click="dateShortcuts(i)"
					>{{ t.text }}</el-button>
				</el-button-group>
				<el-date-picker
					v-else
					class="filter-item"
					v-model="searchDate"
					type="date"
					placeholder="日期"
					:picker-options="pickerOptions"
					:clearable="false"
					@change="timeTabId = -1"
				/>
				<el-button
					:type="dateTimePickerVisible ? 'info' : 'primary'"
					plain
					size="mini"
					@click="dateTimePickerVisible = !dateTimePickerVisible"
				>{{ dateTimePickerVisible ? '返回' : '進階' }}</el-button> -->
				<el-button size="small" class="filter-item" type="primary" icon="el-icon-search" @click="getList()" style="margin-left: 10px;">搜尋</el-button>
			<!-- </span> -->
			
		</div>

		<!-- 資料列表 -->
		<el-table ref="multipleTable" empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }" style="width: 100%">
			<el-table-column 
				v-for="(value, key) in headers" 
				:key="key" :prop="key" 
				:label="value.name" 
				align="center" 
				:sortable="value.sortable"
				:width="value.width"
			>
			</el-table-column>
		</el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />
    
	</div>
</template>

<script>
import moment from "moment";
import { getPothole } from "@/api/car";
import TimePicker from '@/components/TimePicker';
import Pagination from "@/components/Pagination";
import commonMixin from '@/mixins/common';

export default {
	mixins: [commonMixin],
	name: "caseListLog",
	components: { TimePicker, Pagination },
	data() {
	return {
		loading: false,
		dialogMapVisible: true,
		csvVisible: false,
		csvResultVisible: false,
		file: null,
		timeTabId: 1,
		total: 0,
		successMap: [],
		failMap: [],
		dateRange: [ moment().startOf("week").add(1, 'day').toDate(), moment().endOf("week").add(1, 'day').toDate() ],
		dateTimePickerVisible: false,
		pickerOptions: {
			firstDayOfWeek: 1,
			shortcuts: [
				{
					text: "前5",
					onClick(picker) {
						const date = moment().subtract(5, "d");
						picker.$emit("pick", date);
					}
				},
				{
					text: "前4",
					onClick(picker) {
						const date = moment().subtract(4, "d");
						picker.$emit("pick", date);
					}
				},
				{
					text: "前3",
					onClick(picker) {
						const date = moment().subtract(3, "d");
						picker.$emit("pick", date);
					}
				},
				{
					text: "前2",
					onClick(picker) {
						const date = moment().subtract(2, "d");
						picker.$emit("pick", date);
					}
				},
				{
					text: "前1",
					onClick(picker) {
						const date = moment().subtract(1, "d");
						picker.$emit("pick", date);
					}
				},
				{
					text: "今日",
					onClick(picker) {
						const date = moment();
						picker.$emit("pick", date);
					},
				},
			],
			disabledDate(date) {
				return moment(date).valueOf() >= moment().endOf("d").valueOf();
			},
		},
		searchDate: moment().startOf("d"),
		searchRange: "",
		listQuery: {
			filterType: 1,
			// zipCode: 0,
      contractId: 1,
			timeStart: '',
			timeEnd: '',
			pageCurrent: 1,
			pageSize: 50
		},
		area:{
			0: "全部",
			100: '中正區',
			103: '大同區',
			104: '中山區',
			105: '松山區',
			106: '大安區',
			108: '萬華區',
			110: '信義區',
			111: '士林區',
			112: '北投區',
			114: '內湖區',
			115: '南港區',
			116: '文山區',
			999: '橋涵區'
		},
    team: {
      1: '第一分隊',
      2: '第二分隊',
      3: '第三分隊',
      4: '第四分隊',
      5: '第五分隊',
      6: '第六分隊'
    },
		distressLevelMap: {
			1: '輕',
			2: '中',
			3: '重'
		},
		list:[],
		rowActive: {},
		headers: {
			SerialNo: {
        name: '缺失Id',
        sortable: false,
      },
      DistressLevel: {
        name: '缺失程度',
        sortable: false,
      },
      MillingLength: {
        name: '預估長',
        sortable: false,
      },
      MillingWidth: {
        name: '預估寬',
        sortable: false,
      },
			DateCreate: {
				name: '創建時間',
				sortable: false,
			},
      Place: {
        name: '地址',
        sortable: false,
      },
      
		},
		dialogVisible: false,
		InputNotes:'',
		options: {
			tenderRoundMap: {},
			districtMap: {},
			districtOrder: [],
		}
	};
	},
	computed: {},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		formatTime(time) {
			return time ? moment(time).format("YYYY/MM/DD") : "";
		},
		dateShortcuts(index) {
			this.timeTabId = index;

			const DATE_OPTION = {
				TODAY: 0,
				YESTERDAY: 1,
				DAYBEFOREYEST: 2,
				DAYBEFOREYEST2: 3,
				DAYBEFOREYEST3: 4,
				DAYBEFOREYEST4: 5
			};

			switch (index) {
				case DATE_OPTION.TODAY:
					this.searchDate = moment();
					break;
				case DATE_OPTION.YESTERDAY:
					this.searchDate = moment().subtract(1, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST:
					this.searchDate = moment().subtract(2, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST2:
					this.searchDate = moment().subtract(3, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST3:
					this.searchDate = moment().subtract(4, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST4:
					this.searchDate = moment().subtract(5, "d");
					break;
			}
			this.getList();
		},
		getList() {
			this.list = [];
			// const timeStart = moment(this.searchDate).format("YYYY-MM-DD");
			// const timeEnd = moment(this.searchDate).add(1, 'd').format("YYYY-MM-DD");
			if (this.listQuery.contractId == 99) {
				// 顯示全部 有6個分隊(6個標)
				for (let i = 1; i <= 6; i++) {
					getPothole({
						contractId: i,
						// timeStart: timeStart,
						// timeEnd: timeEnd,
						pageCurrent: this.listQuery.pageCurrent,
						pageSize: this.listQuery.pageSize,
					}).then(response => {
						this.total += response.data.total;
						response.data.list.map(item => {
							item.DistressLevel = this.distressLevelMap[item.DistressLevel];
							item.DateCreate = this.formatTime(item.DateCreate);
							item.MillingLength = Math.round(item.MillingLength * 100) / 100;
							item.MillingWidth = Math.round(item.MillingWidth * 100) / 100;
							this.list.push(item);
						});
					}).catch(err => { this.loading = false });
				}
			} else {
				// 只顯示其中一個分隊
				getPothole({
					contractId: this.listQuery.contractId,
					// timeStart: timeStart,
					// timeEnd: timeEnd,
					pageCurrent: this.listQuery.pageCurrent,
					pageSize: this.listQuery.pageSize,
				}).then(response => {
					this.total = response.data.total;
					this.list = response.data.list;
					this.list.map(item => {
						item.DistressLevel = this.distressLevelMap[item.DistressLevel];
						item.DateCreate = this.formatTime(item.DateCreate);
						item.MillingLength = Math.round(item.MillingLength * 100) / 100;
						item.MillingWidth = Math.round(item.MillingWidth * 100) / 100;
					});
				}).catch(err => { this.loading = false });
			}
		}
	}
};
</script>

<style lang="sass">
.inspection-progress
	.el-table
		.success-row
			background: #f0f9eb
		.warning-row
			background: oldlace
	.dialog-footer
		display: flex
		justify-content: center
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 80px
				.el-input__inner
					padding-left: 8px
					padding-right: 10px
				.el-input__suffix
					right: 0
					margin-right: -3px
					transform: scale(0.7)
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
			.el-select.tender-select
				width: 240px
				.el-input__inner
					padding-left: 8px
					padding-right: 10px
					text-align: left
				.el-input__suffix
					right: 0
					margin-right: -3px
					transform: scale(0.7)
</style>
