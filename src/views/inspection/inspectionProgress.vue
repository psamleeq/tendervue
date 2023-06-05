<template>
	<div class="app-container" v-loading="loading">
		<h2>巡查歷程</h2>
		<!-- 搜尋 -->
		<div class="filter-container">
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
					<span>行政區</span>
					</div>
					<el-select
						v-model.number="listQuery.ZipCode"
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
				<div class="el-input el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>收取日</span>
					</div>
					<el-date-picker
						v-model="listQuery.searchDate"
						style="width: 300px"
						type="daterange"
						start-placeholder="開始日期"
						end-placeholder="結束日期"
						:clearable="false"
					/>
				</div>
			</div>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
		</div>

		<!-- 資料列表 -->
		<el-table ref="multipleTable" empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }" style="width: 100%">
			<el-table-column v-for="(value, key) in headers" :key="key" :prop="key" :label="value.name" align="center" :sortable="value.sortable">
				<template slot-scope="{ row, column }">
					<span v-if="['DateCompleted_At'].includes(column.property)">
						<span style="display:inline-block;margin-right:10px">{{ formatTime(row[column.property])}}</span>
						<el-button type="success" size="mini" @click="showDialog(row)">完成</el-button>
					</span>
					<span v-else-if="['DateCreate_At'].includes(column.property)">
						<span>{{ formatTime(row[column.property])}}</span>
					</span>
					<span v-else-if="['Notes'].includes(column.property)">
						<span v-if="row.isEdit">
							<el-input v-model="InputNotes" size="mini" style="width: 150px"></el-input>
							<el-button v-if="row.isEdit" style="padding: 5px 5px" type="info" size="mini" @click="row.isEdit = false;">取消</el-button>
							<el-button v-if="row.isEdit" style="padding: 5px 5px" type="primary" size="mini" @click="row.isEdit = false;setNotes(row)">確定</el-button>				
						</span>
						<span v-else>
							<span>{{ row[column.property] }}</span>
							<el-button type="text" style="margin-left: 10px" size="mini" @click="beforeEditNotes(row)">
								<i class="el-icon-edit" />
							</el-button>
						</span>
					</span>
					<span v-else>
					<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="primary" plain size="mini" round @click="showMap(row)">標記</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 完成 對話框 -->
		<el-dialog title="完成日" :visible.sync="dialogVisible" width="400px">
			<span>是否確定提交完成日?</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="dialogVisible = false;setComplete()">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getInspectionList, setInspectionList } from "@/api/inspection";


export default {
	name: "inspectionProgress",
	data() {
	return {
		loading: false,
		dialogMapVisible: true,
		listQuery: {
			ZipCode:null,
			searchDate:[],
		},
		area:{
			103:"大同區",
			104:"中山區"
		},
		list:[],
		rowActive: {},
		headers:{
			InspectId:{
				name:'編號',
				sortable: false,
			},
			ZipCode:{
				name:'行政區',
				sortable: false,
			},
			DateCreate_At:{
				name:'收取日',
				sortable: false,
			},
			DateCompleted_At:{
				name:'完成日',
				sortable: false,
			},
			Notes:{
				name:'備註',
				sortable: false,
			},
		},
		dialogVisible: false,
		InputNotes:''
	};
	},
	computed: {},
	watch: { },
	created() {
		// 設置收取日的默認值為昨日
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		this.listQuery.searchDate = [yesterday, yesterday]; 
	},
	mounted() {
	},
	methods: {
		showMap(row) {
			this.$router.push({
				path: "/inspection/caseMark",
				query: { inspectId: row.InspectId, caseInspectId: row.InspectId },
			});
		},
		formatTime(time) {
			return time ? moment(time).format("YYYY/MM/DD") : "";
		},
		getList(){
			if (!Number(this.listQuery.ZipCode)||this.listQuery.searchDate==[]) {
				this.$message({
					message: "請選擇行政區",
					type: "error",
				});
			}else if(this.listQuery.searchDate.length==0){
				this.$message({
					message: "請選擇收取日",
					type: "error",
				});
			} else {
				this.loading = true;
				this.list = [];

				const date = new Date(this.listQuery.searchDate[1])
				date.setDate(date.getDate() + 1)
				const newDate = date.toString();

				getInspectionList({
					zipCode: this.listQuery.ZipCode,
					timeStart: this.formatTime(this.listQuery.searchDate[0]),
					timeEnd: this.formatTime(newDate)
				}).then(response => {
					if (response.data.list.length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
					} else {
						this.list = response.data.list;
						this.list.forEach((l)=>{
							this.$set(l, "isEdit", false);
						})
					}
					this.loading = false;
				}).catch(err => {this.loading = false});
			}
		},
		showDialog(row){
			this.dialogVisible=true;
			this.rowActive = JSON.parse(JSON.stringify(row));
		},
		setComplete(){
			this.rowActive.DateCompleted_At=new Date().toISOString()
			console.log('setComplete',this.rowActive.DateCompleted_At);
			this.setResult()
		},
		beforeEditNotes(row){
			row.isEdit = true
			this.InputNotes = row.Notes
		},
		setNotes(row){
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.rowActive.Notes = this.InputNotes
			this.setResult()
		},
		setResult() {
			setInspectionList( this.rowActive.InspectId, {
				dateCompleted: this.formatTime(this.rowActive.DateCompleted_At),
				notes: this.rowActive.Notes,
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "提交成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				// console.log(err);
				this.getList();
			})
		},
		
	},
};
</script>

<style lang="sass">
</style>
