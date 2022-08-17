<template>
  <div class="app-container precipitation" v-loading="loading">
    <h2>每月降雨天數</h2>
    <!-- <div class="filter-container">
			<time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
      <el-button
        class="filter-item"
        type="info"
        icon="el-icon-document"
        :circle="screenWidth<567"
        @click="handleDownload"
      >輸出報表</el-button>
    </div> -->
    
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
        :sortable="value.sortable"
				:formatter="formatContent"
      />
    </el-table>
  </div>
</template>

<script>
import moment from "moment";
// import { getActivReportMJ } from "@/api/analysis";
import TimePicker from '@/components/TimePicker';

export default {
  name: "precipitation",
	components: { TimePicker },
  data() {
    return {
      loading: false,
      timeTabId: -1,
      dateTimePickerVisible: false,
      screenWidth: window.innerWidth,
      daterange: [moment().startOf("d").toDate(), moment().endOf("d").toDate()],
      searchRange: "",
      headers: {
        1: {
					name: "一月",
					sortable: false
				},
        2: {
					name: "二月",
					sortable: false
				},
        3: {
					name: "三月",
					sortable: false
				},
				4: {
					name: "四月",
					sortable: false
				},
				5: {
					name: "五月",
					sortable: false
				},
				6: {
					name: "六月",
					sortable: false
				},
				7: {
					name: "七月",
					sortable: false
				},
				8: {
					name: "八月",
					sortable: false
				},
				9:{
					name: "九月",
					sortable: false
				},
				10: {
					name: "十月",
					sortable: false
				},
				11: {
					name: "十一月",
					sortable: false
				},
				12: {
					name: "十二月",
					sortable: false
				}
      },
      list: [],
    };
  },
	mounted() {
		this.getList(); 
	},
  methods: {
    getList() {
			fetch("https://opendata.cwb.gov.tw/api/v1/rest/datastore/C-B0025-001?Authorization=rdec-key-123-45678-011121314").then(res => res.json()).then(json => {
				const record = json.records.location.filter(loc => loc.station.stationID == "466920")[0];
				const precipitation = record.stationObsTimes.stationObsTime;

				const lastIndex = precipitation.length - 1;
				this.searchRange = `${this.formatTime(precipitation[0].dataDate)} - ${this.formatTime(precipitation[lastIndex].dataDate)}`;
				const nowMonth = moment(precipitation[lastIndex].dataDate).get("month") + 1;

				this.list = [ precipitation.reduce((init, curr) => {
					const month = moment(curr.dataDate).get('month') + 1;
					const precipitationSpec = curr.weatherElements.precipitation;
					if(Number(precipitationSpec) > 0) {
						if(init[month] == undefined) init[month] = 0;
						else init[month]++;
					}
					return init;
				}, {})];

				if(this.list[0][nowMonth] == undefined) this.list[0][nowMonth] = 0;
			});

			// this.list = data;
      // this.loading = true;
      // if (moment(this.daterange[1]).isAfter(moment())) {
      //   this.daterange[1] = moment().endOf("d").toDate();
      // }

      // let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
      // let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
      // this.searchRange = startDate + " - " + endDate;

      // this.list = [];
      // getActivReportMJ({
      //   timeStart: startDate,
      //   timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
      // }).then((response) => {
      //   if (response.data.list.length == 0) {
      //     this.$message({
      //       message: "查無資料",
      //       type: "error",
      //     });
      //   } else {
      //     this.list = response.data.list;
      //     this.list.map(l=>{
      //       l.Innings = Number(l.Innings)
      //       l.Rounds = Number(l.Rounds)
      //     })
      //   }
      //   this.loading = false;
      // });
    },
    formatTime(time) {
      return moment(time).utc().format("YYYY-MM-DD");
    },
		formatContent(row, column) {
			const num = row[column.property];
      if (Number(num)) return num;
      else return "-";
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
</style>