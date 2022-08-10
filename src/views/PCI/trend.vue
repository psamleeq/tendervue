<template>
  <div class="app-container PCI-trend" v-loading="loading">
    <h2>PCI趨勢圖</h2>
    <div class="filter-container">
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

		<div class="chart" ref="chart" />

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
import echarts from 'echarts/lib/echarts';
require('echarts/theme/macarons');
require('echarts/lib/chart/line');
// import { getActivReportMJ } from "@/api/analysis";
import TimePicker from '@/components/TimePicker';

const data = [
	{
		month: "2021/03",
		PCIUnder55: 206,
		PCIUnder70: 417,
		PCIUnder100: 604,
		PCI100: 1280
	},
	{
		month: "2021/04",
		PCIUnder55: 367,
		PCIUnder70: 762,
		PCIUnder100: 997,
		PCI100: 2223
	},
	{
		month: "2021/05",
		PCIUnder55: 522,
		PCIUnder70: 871,
		PCIUnder100: 1380,
		PCI100: 3794
	},
	{
		month: "2021/06",
		PCIUnder55: 912,
		PCIUnder70: 1375,
		PCIUnder100: 2327,
		PCI100: 5356
	},
	{
		month: "2021/07",
		PCIUnder55: 1237,
		PCIUnder70: 1511,
		PCIUnder100: 2835,
		PCI100: 4387
	},
	{
		month: "2021/08",
		PCIUnder55: 1404,
		PCIUnder70: 1576,
		PCIUnder100: 3022,
		PCI100: 3968
	},
	{
		month: "2021/09",
		PCIUnder55: 1416,
		PCIUnder70: 1682,
		PCIUnder100: 3125,
		PCI100: 3747
	},
	{
		month: "2021/10",
		PCIUnder55: 1915,
		PCIUnder70: 1759,
		PCIUnder100: 2985,
		PCI100: 3311
	},
]

export default {
  name: "PCITrend",
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
				month: {
					name: "月份",
					sortable: false
				},
        PCIUnder55: {
					name: "PCI <= 55",
					sortable: false,
					chartType: 'line'
				},
        PCIUnder70: {
					name: "55 < PCI <= 70",
					sortable: false,
					chartType: 'line'
				},
        PCIUnder100: {
					name: "70 < PCI <= 100",
					sortable: false,
					chartType: 'line'
				},
				PCI100: {
					name: "PCI = 100",
					sortable: false,
					chartType: 'line'
				},
      },
      list: [],
			chart: null
    };
  },
	mounted() {
		this.chart = echarts.init(this.$refs.chart, 'macarons', {
			width: 'auto',
			height: 'auto'
		});
		this.setChartOptions();
	},
  methods: {
    getList() {
			this.list = data;
			this.setChartOptions();
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
		setChartOptions() {
			const headerFilter = Object.fromEntries(Object.entries(this.headers).filter(([key, _]) => key != "month"));
			let legend = [];
			let series = [];

			for(const key in headerFilter) {
				legend.push(headerFilter[key].name);
				series.push({
					type: headerFilter[key].chartType,
					name: headerFilter[key].name,
					data: this.list.map(l=>l[key]),
					smooth: false
				});
			}

			const options = {
				xAxis: {
					name: "月份",
					type: 'category',
					data: this.list.map(l=>l.month),
					boundaryGap: false,
          axisTick: {
            show: false
          }
				},
				yAxis: {
					name: '區塊數量',
					type: 'value',
					axisTick: {
            show: false
					}
				},
				tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
				grid: {
					top: 55,
					bottom: 20,
          left: 30,
          right: 30,
          containLabel: true
        },
				legend: { data: legend },
				series: series
			};

			this.chart.setOption(options);
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
.PCI-trend
	.chart
		height: 400px
</style>