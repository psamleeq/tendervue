<template>
  <div class="app-container case-statics" v-loading="loading">
    <h2>維護案件</h2>
		<aside>資料初始為2022年6月</aside>
    <div class="filter-container">
			<el-select class="filter-item" v-model="listQuery.dist" :disabled="Object.keys(districtList).length <= 1">
				<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="Number(zip)" />
			</el-select>
			<el-select class="filter-item" v-model="listQuery.caseType" :disabled="Object.keys(caseType).length <= 1">
				<el-option v-for="(name, type) in caseType" :key="type" :label="name" :value="Number(type)" />
			</el-select>
			<time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
      <!-- <el-button
        class="filter-item"
        type="info"
        icon="el-icon-document"
        :circle="screenWidth<567"
        @click="handleDownload"
      >輸出報表</el-button> -->
    </div>
    
    <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5>

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
      <!-- <el-table-column 
        v-for="header in Object.keys(headers['fixed'])" :prop="header" :label="headers[reportCate]['fixed'][header]"
      align="center" fixed/>-->
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

  </div>
</template>

<script>
import moment from "moment";
import { getCaseList } from "@/api/case";
import TimePicker from '@/components/TimePicker';
import { dateWatcher } from "@/utils/pickerOptions";

// const data = [
// 	{
// 		type: "人行道(m2)",
// 		total: 258
// 	},
// 	{
// 		type: "水溝(m)",
// 		total: 1119
// 	},
// 	{
// 		type: "AC鉋鋪(m2)",
// 		total: 25489
// 	},
// 	{
// 		type: "熱再生修復(m2)",
// 		total: 2405
// 	}
// ]

export default {
  name: "caseStatics",
	components: { TimePicker },
  data() {
    return {
      loading: false,
      timeTabId: 4,
      dateTimePickerVisible: false,
      screenWidth: window.innerWidth,
      daterange: [moment().startOf("year").toDate(), moment().endOf("year").toDate()],
      searchRange: "",
			listQuery: {
				caseType: 1,
				dist: 104
      },
      headers: {
				CaseNo: {
					name: "案號",
					sortable: false
				},
				CaseName: {
					name: "地址",
					sortable: false
				},
        CType1NO: {
					name: "派工單號",
					sortable: false,
				},
				total: {
					name: "面積",
					sortable: false,
				},
				CloseDate: {
					name: "完工日期",
					sortable: false,
				}
      },
      list: [],
			typeMap: {
				hotRepair: "熱再生修復(m2)",
				AC: "AC鉋鋪(m2)",
				ditch: "水溝(m)",
				sidewalk: "人行道(m2)"
			},
			districtList: {
				// 100: {
				// 	"name": "中正區",
				// 	"engName": "Zhongzheng"
				// },
				// 103: {
				// 	"name": "大同區",
				// 	"engName": "Datong"
				// },
				104: {
					"name": "中山區",
					"engName": "Zhongshan"
				},
				// 105: {
				// 	"name": "松山區",
				// 	"engName": "Songshan"
				// },
				// 106: {
				// 	"name": "大安區",
				// 	"engName": "Da’an"
				// },
				// 108: {
				// 	"name": "萬華區",
				// 	"engName": "Wanhua",
				// },
				// 110: {
				// 	"name": "信義區",
				// 	"engName": "Xinyi"
				// },
				// 111: {
				// 	"name": "士林區",
				// 	"engName": "Shilin"
				// },
				// 112: {
				// 	"name": "北投區",
				// 	"engName": "Beitou"
				// },
				// 114: {
				// 	"name": "內湖區",
				// 	"engName": "Neihu"
				// },
				// 115: {
				// 	"name": "南港區",
				// 	"engName": "Nangang"
				// },
				// 116: {
				// 	"name": "文山區",
				// 	"engName": "Wenshan"
				// }
			},
			caseType: {
				1: "熱再生修復",
				2: "AC鉋鋪",
				3: "水溝",
				4: "人行道"
			},
			chart: null
    };
  },
	mounted() {
		// this.getList();
	},
  methods: {
    getList() {
      this.loading = true;
			dateWatcher(this.daterange);

      let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
      let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
      this.searchRange = startDate + " - " + endDate;

      this.list = [];
      getCaseList({
				caseType: this.listQuery.caseType,
        timeStart: startDate,
        timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
      }).then((response) => {
        if (response.data.list.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
          this.list = response.data.list;
        }
        this.loading = false;
      }).catch(err => { this.loading = false; });
    },
		formatter(row, column) {
      if(Number(row[column.property])) return row[column.property].toLocaleString();
      else return row[column.property];
    },
    formatTime(time) {
      return moment(time).utc().format("YYYY-MM-DD");
    },
    handleDownload() {
      let tHeader = Object.values(this.headers);
      let filterVal = Object.keys(this.headers);
      // tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
      // filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
      let data = this.formatJson(filterVal, this.list);

      import("@/vendor/Export2Excel").then((excel) => {
        excel.export_json_to_excel({
          header: tHeader,
          data,
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
.case-statics
	.filter-container 
		.el-select
			width: 110px
		.el-input__inner
			padding-left: 5px
			text-align: center
	.filter-item
		margin-right: 5px
	.chart
		height: 400px
</style>