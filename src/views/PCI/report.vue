<template>
  <div class="app-container PCI-report" v-loading="loading">
    <h2>PCI報表</h2>
    <div class="filter-container">
			<time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
      <el-button
        class="filter-item"
        type="info"
        icon="el-icon-document"
        :circle="screenWidth<567"
        @click="handleDownload"
      >輸出報表</el-button>
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
        :sortable="value.sortable"
      />
    </el-table>
  </div>
</template>

<script>
import moment from "moment";
// import { getActivReportMJ } from "@/api/analysis";
import TimePicker from '@/components/TimePicker';
import { data } from "../../../public/assets/json/pci.json"

export default {
  name: "PCIReport",
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
        id: {
					name: "單元編號",
					sortable: false
				},
        dist: {
					name: "行政區",
					sortable: false
				},
        roadName: {
					name: "道路名稱",
					sortable: false
				},
        roadId: {
					name: "道路編號",
					sortable: false
				},
				roadArea: {
					name: "道路面積",
					sortable: false
				},
				PCIValue_2103: {
					name: "PCI_2021/03",
					sortable: true
				},
				PCIValue_2104: {
					name: "PCI_2021/04",
					sortable: true
				},
				PCIValue_2105: {
					name: "PCI_2021/05",
					sortable: true
				},
				PCIValue_2106: {
					name: "PCI_2021/06",
					sortable: true
				},
				PCIValue_2107:{
					name: "PCI_2021/07",
					sortable: true
				},
				PCIValue_2108: {
					name: "PCI_2021/08",
					sortable: true
				},
				PCIValue_2109: {
					name: "PCI_2021/09",
					sortable: true
				},
				PCIValue_2110: {
					name: "PCI_2021/10",
					sortable: true
				}
      },
      list: [],
    };
  },
  methods: {
    getList() {
			this.list = data;
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