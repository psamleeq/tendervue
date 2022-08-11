<template>
  <div class="app-container case-report" v-loading="loading">
    <h2>派工和PCI分析</h2>
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
require('echarts/lib/chart/bar');
// import { getActivReportMJ } from "@/api/analysis";
import TimePicker from '@/components/TimePicker';

const data = [
	{
		month: "2021/03",
		inspect: 11082,
		"1999Report": 4,
		dispatch: 34,
		PCIAverage: 86.19
	},
	{
		month: "2021/04",
		inspect: 9063,
		"1999Report": 4,
		dispatch: 93,
		PCIAverage: 88.48
	},
	{
		month: "2021/05",
		inspect: 12462,
		"1999Report": 4,
		dispatch: 26,
		PCIAverage: 95.80
	},
	{
		month: "2021/06",
		inspect: 12927,
		"1999Report": 3,
		dispatch: 78,
		PCIAverage: 86.6
	},
	{
		month: "2021/07",
		inspect: 12984,
		"1999Report": 3,
		dispatch: 28,
		PCIAverage: 83.53
	},
	{
		month: "2021/08",
		inspect: 15182,
		"1999Report": 7,
		dispatch: 62,
		PCIAverage: 82.1
	},
	{
		month: "2021/09",
		inspect: 20392,
		"1999Report": 6,
		dispatch: 38,
		PCIAverage: 81.43
	},
	{
		month: "2021/10",
		inspect: 14771,
		"1999Report":33,
		dispatch: 71,
		PCIAverage: 78.35
	}
]

export default {
  name: "caseReport",
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
				inspect: {
					name: "聖東巡查",
					sortable: false,
					chartType: 'bar'
				},
				"1999Report": {
					name: "1999查報",
					sortable: false,
					chartType: 'bar'
				},
        dispatch: {
					name: "派工",
					sortable: false,
					chartType: 'bar'
				},
				PCIAverage: {
					name: "PCI平均",
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
			const colors = ["#e5cf0d","#8d98b3","#7eb00a","#ffb980","#95706d","#b6a2de","#2ec7c9","#5ab1ef","#d87a80","#97b552","#dc69aa","#07a2a4","#9a7fd1","#588dd5","#f5994e","#c05050","#59678c","#c9ab00","#6f5553","#c14089"];
			const headerFilter = Object.fromEntries(Object.entries(this.headers).filter(([key, _]) => key != "month"));
			let legend = [];
			let series = [];

			for(const key in headerFilter) {
				legend.push(headerFilter[key].name);
				series.push({
					type: headerFilter[key].chartType,
					name: headerFilter[key].name,
					data: this.list.map(l=>l[key]),
					yAxisIndex: headerFilter[key].chartType == "line" ? 2 : key == "inspect" ? 0 : 1,
					smooth: false
				});
			}

			const options = {
				color: colors,
				xAxis: {
					name: "月份",
					type: 'category',
					data: this.list.map(l=>l.month),
          axisTick: {
            show: false
          }
				},
				yAxis: [
					{
						name: '案件數(聖東)',
						type: 'value',
						position: 'left',
						offset: 80,
						axisTick: {
							show: false
						},
						axisLine: { lineStyle: { color: colors[0] } }
					},
					{
						name: '案件數(其他)',
						type: 'value',
						position: 'left',
						axisTick: { show: false }
					},
					{
						name: 'PCI平均',
						type: 'value',
						position: 'right',
						axisTick: { show: false },
						axisLine: { lineStyle: { color: colors[3] } }
					}
				],
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
          left: 80,
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
.case-report
	.chart
		height: 400px
</style>