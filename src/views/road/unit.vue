<template>
  <div class="app-container road-unit" v-loading="loading">
    <h2>道路單元</h2>
    <div class="filter-container">
			<div class="filter-item">
				<el-input
					v-model="listQuery.roadName"
					placeholder="請輸入道路名稱"
				>
					<el-select slot="prepend" v-model="listQuery.dist" :disabled="Object.keys(districtList).length <= 1" @change="listQuery.pageCurrent = 1; getList();">
						<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="Number(zip)" />
					</el-select>
				</el-input>
			</div>
			<!-- <time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/> -->

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
      <el-button
        class="filter-item"
        type="info"
        icon="el-icon-document"
        :circle="screenWidth<567"
        @click="handleDownload"
      >輸出列表</el-button>
    </div>

		<h4 v-if="list.length != 0">道路單元數：{{ total }}</h4>
    
    <!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

    <el-table
      empty-text="目前沒有資料"
      :data="list"
      border
      fit
      highlight-current-row
      :header-cell-style="{'background-color': '#F2F6FC'}"
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
    </el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import moment from "moment";
import { getRoadUnit } from "@/api/road";
import TimePicker from '@/components/TimePicker';
import Pagination from '@/components/Pagination';

export default {
  name: "roadUnit",
	components: { TimePicker, Pagination },
  data() {
    return {
      loading: false,
      timeTabId: moment().year(),
      dateTimePickerVisible: false,
      screenWidth: window.innerWidth,
      daterange: [ moment().month(5).startOf("month").toDate(), moment().endOf("year").toDate() ],
      searchRange: "",
			listQuery: {
				roadName: "",
				dist: 0,
        pageCurrent: 1,
        pageSize: 20,
      },
      headers: {
				RoadId: {
					name: "道路編號",
					sortable: false
				},
        notes: {
					name: "單元編號",
					sortable: true
				},
        dist: {
					name: "行政區",
					sortable: true
				},
				roadName: {
					name: "道路名稱",
					sortable: true
				},
				crossName: {
					name: "交叉道路名稱",
					sortable: false
				},
				roadStart: {
					name: "起始道路名稱",
					sortable: false
				},
				roadEnd: {
					name: "結束道路名稱",
					sortable: false
				},
				lane: {
					name: "車道數",
					sortable: false
				},
				width: {
					name: "計畫路寬",
					sortable: true
				},
				widthReal: {
					name: "實際路寬",
					sortable: true
				},
				length: {
					name: "區段長度",
					sortable: true
				},
				area: {
					name: "道路面積",
					sortable: true
				},
				areaCross: {
					name: "道路面積(扣除路口重覆)",
					sortable: true
				},
			},
			total: 0,
      list: [],
			roadIdMap: {
				0: "路口",
				1: "順向",
				2: "逆向"
			},
			districtList: {
				0: {
					"name": "台北市",
					"engName": "Taipei"
				},
				100: {
					"name": "中正區",
					"engName": "Zhongzheng"
				},
				103: {
					"name": "大同區",
					"engName": "Datong"
				},
				104: {
					"name": "中山區",
					"engName": "Zhongshan"
				},
				105: {
					"name": "松山區",
					"engName": "Songshan"
				},
				106: {
					"name": "大安區",
					"engName": "Da’an"
				},
				108: {
					"name": "萬華區",
					"engName": "Wanhua",
				},
				110: {
					"name": "信義區",
					"engName": "Xinyi"
				},
				111: {
					"name": "士林區",
					"engName": "Shilin"
				},
				112: {
					"name": "北投區",
					"engName": "Beitou"
				},
				114: {
					"name": "內湖區",
					"engName": "Neihu"
				},
				115: {
					"name": "南港區",
					"engName": "Nangang"
				},
				116: {
					"name": "文山區",
					"engName": "Wenshan"
				}
			},
    };
  },
	created() {
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
				dist: this.listQuery.dist,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize,
				// timeStart: startDate,
				// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
			}
			if(this.listQuery.roadName.length > 0) query.roadName = this.listQuery.roadName;

			getRoadUnit(query).then(response => {
        if (response.data.list.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
					this.total = response.data.total;
					this.list = response.data.list;
					this.list.forEach(l => {
						l.dist = this.districtList[l.zip].name
					})
				}
        this.loading = false;
      }).catch(err => { this.loading = false; });
    },
		indexMethod(index) {
			return (index + 1) + (this.listQuery.pageCurrent - 1) * this.listQuery.pageSize;
		},
		formatter(row, column) {
			if(Number(row[column.property])) return row[column.property].toLocaleString();
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
				dist: this.listQuery.dist,
				pageCurrent: 1,
				pageSize: this.total,
				// timeStart: startDate,
				// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
			}
			if(this.listQuery.roadName.length > 0) query.roadName = this.listQuery.roadName;

			getRoadUnit(query).then(response => {
				let list = response.data.list;
				list.forEach(l => {
					l.dist = this.districtList[l.zip].name
				})

				let tHeader = Object.values(this.headers).map(h => h.name);
				let filterVal = Object.keys(this.headers);
				// tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
				// filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
				let data = this.formatJson(filterVal, list);

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
</style>