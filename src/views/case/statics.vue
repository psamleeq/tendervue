<template>
  <div class="app-container case-statics" v-loading="loading">
    <h2>維護數量</h2>
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
require('echarts/lib/chart/bar');
// import { getActivReportMJ } from "@/api/analysis";
import TimePicker from '@/components/TimePicker';

const data = [
	{
		type: "人行道(m2)",
		total: 258
	},
	{
		type: "水溝(m)",
		total: 1119
	},
	{
		type: "AC鉋鋪(m2)",
		total: 25489
	},
	{
		type: "熱再生修復(m2)",
		total: 2405
	}
]

export default {
  name: "caseStatics",
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
				type: {
					name: "類型",
					sortable: false
				},
        total: {
					name: "區塊數量",
					sortable: false,
					chartType: 'bar'
				}
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
			const headerFilter = Object.fromEntries(Object.entries(this.headers).filter(([key, _]) => key != "type"));
			let legend = [];
			let series = [];

			for(const key in headerFilter) {
				if(headerFilter[key].chartType == null) continue;
				legend.push(headerFilter[key].name);
				series.push({
					type: headerFilter[key].chartType,
					name: headerFilter[key].name,
					data: this.list.map(l=>l[key]),
					barWidth: '40%'
				});
			}

			const options = {
				xAxis: {
					name: "區塊數量",
					type: 'value',
					boundaryGap: false,
          axisTick: {
            alignWithLabel: true
          }
				},
				yAxis: {
					name: '類型',
					type: 'category',
					data: this.list.map(l => l.type),
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
          right: 100,
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
.case-statics
	.chart
		height: 400px
</style>