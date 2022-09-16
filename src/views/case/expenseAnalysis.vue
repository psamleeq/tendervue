<template>
  <div class="app-container expense-analysis" v-loading="loading">
    <h2>經費分析</h2>
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
    
    <!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

		<div class="chart" ref="chart" />

    <el-table
      empty-text="目前沒有資料"
      :data="tempList"
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
        :sortable="value.sortable"
      >
				<template slot-scope="{ row }">
					<el-input
						v-if="isEdit(row, value) && value.editType == 'string'"
						v-model="row[key]"
						size="mini"
						placeholder="類別"
						style="width: 200px"
					/>
					<el-input-number
						v-else-if="isEdit(row, value) && value.editType == 'number'"
						v-model="row[key]"
						size="mini"
						:precision="0"
						:step="1"
						:min="0"
					/>
					<span v-else>{{ formatContent(row, key) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="動作" align="center">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.id == undefined"
            type="success"
            size="mini"
            @click="addItem();"
          >新增</el-button>
          <span v-else-if="row.id != undefined">
            <el-button
              v-if="row.editValue"
              type="success"
              size="mini"
              @click="editItem(row);"
            >確定</el-button>
            <span v-else>
              <el-button
                type="primary"
                style="margin-left: 10px"
                size="mini"
                @click="row.editValue = true; this.getList();"
							>修改</el-button>
              <el-button
                type="danger"
                size="mini"
                @click="removeItem(row)"
              >刪除</el-button>
            </span>
          </span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import moment from "moment";
import echarts from 'echarts/lib/echarts';
require('echarts/theme/macarons');
require('echarts/lib/chart/pie');
import { getExpenseAmt, setExpenseAmt, delExpenseAmt } from "@/api/case";
// import TimePicker from '@/components/TimePicker';

export default {
  name: "expenseAnalysis",
	// components: { TimePicker },
  data() {
    return {
      loading: false,
      // timeTabId: -1,
      // dateTimePickerVisible: false,
      // screenWidth: window.innerWidth,
      // daterange: [moment().startOf("d").toDate(), moment().endOf("d").toDate()],
      // searchRange: "",
      headers: {
				type: {
					name: "類別",
					sortable: false,
					editable: true,
					editType: "string"
				},
				amount: {
					name: "金額",
					sortable: false,
					editable: true,
					editType: "number",
					chartType: 'bar'
				}
			},
			list: [],
			newItem: {
				type: "",
				amount: 1
			},
			chart: null
    };
  },
	computed: {
		tempList() {
			return [ ...this.list, this.newItem ]
		}
	},
	mounted() {
		this.chart = echarts.init(this.$refs.chart, 'macarons', {
			width: 'auto',
			height: 'auto'
		});
		this.getList();
	},
  methods: {
		getList() {
			this.loading = true;
			this.list = [];
			getExpenseAmt().then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
				}
				this.setChartOptions();
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		isEdit(row, value) {
			return (row.id == undefined && value.editable) || ( row.id != undefined && row.editValue) 
		},
		addItem() {
			setExpenseAmt({
				type: this.newItem.type,
				amount: this.newItem.amount
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "新增成功",
						type: "success",
					});

					this.newItem = {
						type: "",
						amount: 1
					};
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		editItem(row) {
			setExpenseAmt({
				type: row.type,
				amount: row.amount
			}).then(response => {
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
		removeItem(row) {
			delExpenseAmt(row.id).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "刪除成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		setChartOptions() {
			const series = [{
				type: 'pie',
				radius: ['30%', '70%'],
				data: this.list.map(l => ({ value: l.amount, name: l.type })),
				label: { 
					formatter: '{d}%',
					fontSize: 14
				}
			}];

			const options = {
				title: {
          // text: '成效式契約經費分析',
          textStyle: {
            color: 'black',
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
				grid: {
					top: 55,
					bottom: 20,
          left: 30,
          right: 100,
          containLabel: true
        },
				legend: { 
					orient: 'vertical',
					type: 'plain',
					top: 'middle',
					right: '10%',
					textStyle: { fontSize: 14 },
					data: this.list.map(l => l.type) 
				},
				series: series
			};

			this.chart.setOption(options);
		},
    formatTime(time) {
      return moment(time).utc().format("YYYY-MM-DD");
    },
		formatContent(row, key) {
			if(key == "type") return row[key];
      else if (row[key] == 0 || Number(row[key])) return row[key].toLocaleString();
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
.expense-analysis
	.chart
		height: 400px
</style>