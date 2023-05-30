<template>
	<div class="app-container" v-loading="loading">
	<h2>巡查歷程</h2>
	<div class="filter-container">
      <div class="filter-item">
        <div
          class="el-input el-input--medium el-input-group el-input-group--prepend"
        >
          <div class="el-input-group__prepend">
            <span>行政區</span>
          </div>
          <el-select
            v-model.number="listQuery.administrativeArea"
            placeholder="請選擇"
            popper-class="type-select"
            style="width: 100px"
          >
            <el-option
              v-for="(name, id) in area"
              :key="id"
              :value="Number(id)"
              :label="name"
            />
          </el-select>
        </div>
      </div>
	  <div class="filter-item">
        <div
          class="el-input el-input--medium el-input-group el-input-group--prepend"
        >
          <div class="el-input-group__prepend">
            <span>收取日</span>
          </div>
          <el-date-picker
            v-model="searchDate"
            style="width: 200px"
            type="date"
            placeholder="收取日期"
            :clearable="false"
          />
        </div>
      </div>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="getList()"
        >搜尋</el-button
      >
    </div>
	<el-table
		ref="multipleTable"
		empty-text="目前沒有資料"
		:data="list"
		border
		fit
		:header-cell-style="{ 'background-color': '#F2F6FC' }"
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
		<template slot-scope="{ row, column }">
			<span v-if="['CompleteDate'].includes(column.property)">
			<el-button>完成</el-button>
			</span>
			<span v-else-if="['Note'].includes(column.property)">
			<el-input type="text"> </el-input>
			</span>
			<span v-else>
			<span>{{ row[column.property] || "-" }}</span>
			</span>
		</template>
		</el-table-column>
	</el-table>
	</div>
</template>

<script>
import moment from "moment";

export default {
	name: "inspectionProgress",
	data() {
	return {
		searchDate: '',
		loading: false,
		listQuery: {
			administrativeArea:'',
			recieveDate:''
		},
		area:{
			1:"大同區",
			2:"中山區"
		},
		list:[],
		headers:{
		Id:{
			name:'編號',
			sortable: false,
		},
		Administrative:{
			name:'行政區',
			sortable: false,
		},
		ReceiveDate:{
			name:'收取日',
			sortable: false,
		},
		CompleteDate:{
			name:'完成日',
			sortable: false,
		},
		Note:{
			name:'備註',
			sortable: false,
		},
		}
	};
	},
	computed: {},
	watch: { },
	created() {
	},
	mounted() {},
	methods: {
		getList(){
			console.log('getList');
		},
	},
};
</script>

<style lang="sass">
</style>
