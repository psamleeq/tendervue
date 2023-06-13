<template>
	<div class="app-container" v-loading="loading">
		<h2>帳號列表</h2>
		<div class="filter-container">
			<div class="filter-item">
				<el-button @click="showAddDialog=true" type="primary">新增帳號</el-button>
			</div>
		</div>
		<el-table
			:data="list"
			style="width: 60%">
			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<el-switch
						v-if="['Active'].includes(column.property)"
						:value="String(row.Active)" 
						@change="updateActive(row, $event)"
						active-color="#13ce66"
						inactive-color="#ff4949"
						active-value="1"
    					inactive-value="0">
					</el-switch>
					<span v-else>
							<span>{{ row[column.property] }}</span>
					</span>
				</template>
			</el-table-column>
		</el-table>

		<!-- 新增帳號對話框 -->
		<el-dialog
			title="提示"
			:visible.sync="showAddDialog"
			width="30%">
			<el-form ref="form" :model="form" label-width="50px">
				<el-form-item label="帳號">
					<el-input v-model="form.account"></el-input>
				</el-form-item>
				<el-form-item label="密碼">
					<el-input v-model="form.password"></el-input>
				</el-form-item>
				<el-form-item label="暱稱">
					<el-input v-model="form.nickname"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showAddDialog = false">取消</el-button>
				<el-button type="primary" @click="addAccount()">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { getAccountList,addAcount,changeActive } from "@/api/accountList";


export default {
	name: "accountList",
	data() {
		return {
			loading: false,
			showAddDialog:false,
			list: [],
			headers:{
				UserName: {
					name: "帳號",
					sortable: false
				},
				NickName: {
					name: "暱稱",
					sortable: false
				},
				Active: {
					name: "狀態",
					sortable: false
				},
			},
			form: {
				account:"",
				password:"",
				nickname:""
			},
			
		};
	},
	computed: {
		
	},
	watch: {},
	created() {
	},
	mounted() {
		this.getList()
	},
	methods: {
		updateActive(row,value){
			changeActive({
				"userId": row.UserId,
				"isActive": Number(value)
			}).then(response=>{
				this.getList()
			}).catch(err => {this.loading = false});
		},
		getList(){
			getAccountList().then(response=>{
				if (response.data.list.length == 0) {
						if(showMsg) this.$message({
							message: "查無資料",
							type: "error",
						});
						this.total = 0;
					} else {
						this.list = response.data.list;
					}
			})
		},
		addAccount(){
			this.showAddDialog = false;
			addAcount({
				account: this.form.account,
				password: this.form.password,
				nickname: this.form.nickname
			}).then(response => {
					// console.log(response);
					this.getList()
					this.loading = false;
			}).catch(err => {this.loading = false});
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.addAcountContainer
	height: 150px
	display:flex
	flex-direction:column
	align-items: stretch
	align-content:space-around
</style>