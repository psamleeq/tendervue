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
				<div style="font-size: 12px; color: #909399">收取日</div>
				<time-picker class="filter-item" :shortcutType="'day'" :timeTabId.sync="timeTabId" :dateRange.sync="listQuery.searchDate" @search="getList"/>
			</div>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
		</div>

		<!-- 資料列表 -->
		<el-table ref="multipleTable" empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }" style="width: 100%">
			<el-table-column v-for="(value, key) in headers" :key="key" :prop="key" :label="value.name" align="center" :sortable="value.sortable">
				<template slot-scope="{ row, column }">
					<span v-if="['State'].includes(column.property)">
						<span v-if="row.DateCompleted_At">
							{{ row.DateCompleted_With_Name }} 於 {{ formatTime(row.DateCompleted_At)}} 備註完成
						</span>
						<span v-else-if="row.Duty_with">
							{{ row.Duty_with_Name }} 標記中
						</span>
						<span v-else> - </span>
						<el-button v-if="checkPermission(['inspection.marker']) && row.DateCompleted_At" type="danger" size="mini" round plain @click="showDialog(row, -1)">撤銷</el-button>
					</span>
					<span v-else-if="['DateCreate_At'].includes(column.property)">
						<span>{{ formatTime(row[column.property]) }}</span>
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
					<span v-else-if="['ZipCode'].includes(column.property)">
						<span>{{ getAreaName(row.ZipCode) }}</span>
					</span>
					<span v-else>
					<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column v-if="checkPermission(['inspection.marker'])" label="操作" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
						<el-button v-if="!row.DateCompleted_At" class="btn-action" type="primary" plain size="mini" round @click="showMap(row)">標記</el-button>
						<el-button class="btn-action" type="info" plain size="mini" round @click="showList(row)">列表</el-button>
						<el-button v-if="!row.DateCompleted_At" type="success" size="mini" round @click="showDialog(row, 2)">完成</el-button>
					</el-button-group>
				</template>
			</el-table-column>
		</el-table>

		<!-- 確認 對話框 -->
		<el-dialog title="確認" :visible.sync="dialogVisible" width="400px">
			<span>是否確定
				<span v-if="rowActive.state == -1" style="color: #F56C6C">撤銷</span>
				<span v-else-if="rowActive.state == 2" style="color: #409EFF">提交</span> 完成?
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="dialogVisible = false; setResult();">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getInspectionList, setInspectionList } from "@/api/inspection";
import checkPermission from '@/utils/permission';
import TimePicker from '@/components/TimePicker';

export default {
	name: "inspectionProgress",
	components: { TimePicker },
	data() {
	return {
		loading: false,
		dialogMapVisible: true,
		timeTabId: 1,
		listQuery: {
			ZipCode:0,
			searchDate:[],
		},
		area:{
			0: "全部",
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
			Notes:{
				name:'備註',
				sortable: false,
			},
			State:{
				name:'狀態',
				sortable: false,
			}
		},
		dialogVisible: false,
		InputNotes:''
	};
	},
	computed: {},
	watch: {},
	created() {
		// 設置收取日的默認值為昨日
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		this.listQuery.searchDate = [yesterday, yesterday]; 
	},
	mounted() {},
	methods: {
		checkPermission,
		showMap(row) {
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.$set(this.rowActive, "state", 1);

			this.setResult().then(() => {
				this.$router.push({
					path: "/inspection/caseMark",
					query: { inspectId: row.InspectId, caseInspectId: row.InspectId },
				});
			})
		},
		showList(row) {
			this.$router.push({
				path: "/inspection/caseMarkList",
				query: { caseInspectId: row.InspectId },
			});
		},
		formatTime(time) {
			return time ? moment(time).format("YYYY/MM/DD") : "";
		},
		getList(){
			if ((this.listQuery.ZipCode != 0 && !Number(this.listQuery.ZipCode)) || this.listQuery.searchDate==[]) {
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
		getAreaName(zipcode){
			const areaMap = {
				103: '大同區',
				104: '中山區',
			};
			return areaMap[zipcode] || "-"
		},
		showDialog(row, state){
			this.dialogVisible=true;
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.$set(this.rowActive, "state", state);
		},
		beforeEditNotes(row){
			row.isEdit = true
			this.InputNotes = row.Notes
		},
		setNotes(row){
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.rowActive.Notes = this.InputNotes;
			this.$set(this.rowActive, "state", 0);
			this.setResult()
		},
		async setResult() {
			return new Promise(resolve => {
				setInspectionList(this.rowActive.InspectId, {
					state: this.rowActive.state,
					notes: this.rowActive.Notes || null,
				}).then(response => {
					if ( response.statusCode == 20000 ) {
						this.$message({
							message: "提交成功",
							type: "success",
						});
						this.getList();
						resolve();
					} 
				}).catch(err => {
					// console.log(err);
					this.getList();
				})
			})
		}
	}
};
</script>

<style lang="sass">
</style>
