<template>
	<div class="app-container" v-loading="loading">
		<h2>帳號列表</h2>
		<div style="display:flex; flex-direction: row-reverse; margin:5px">
			<el-button @click="showAddDialog=true" type="success">新增帳號</el-button>
		</div>
		<el-table
			:data="list"
			empty-text="目前沒有資料"
			style="width: 100%"
			border
			fit
			:header-cell-style="{ 'background-color': '#F2F6FC' }">
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
					<span v-else-if="['Create_At','Update_At'].includes(column.property)">
							<span>{{ formatTime(row[column.property]) }}</span>
					</span>
					<span v-else-if="['changePassword'].includes(column.property)">
						<el-button @click="showUpdate(row)" >修改密碼</el-button>
					</span>
					<span v-else>
							<span>{{ row[column.property] }}</span>
					</span>
				</template>
			</el-table-column>
		</el-table>

		<!-- 新增帳號對話框 -->
		<el-dialog
			title="新增帳號"
			:visible.sync="showAddDialog"
			width="30%">
			<el-form ref="form" :model="newAccountForm" label-width="50px">
				<el-form-item label="帳號">
					<el-input v-model="newAccountForm.account"></el-input>
				</el-form-item>
				<el-form-item label="密碼">
					<el-input v-model="newAccountForm.password"></el-input>
				</el-form-item>
				<el-form-item label="暱稱">
					<el-input v-model="newAccountForm.nickname"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showAddDialog = false">取消</el-button>
				<el-button type="primary" @click="addAccount()">確定</el-button>
			</span>
		</el-dialog>

		<!-- 修改密碼對話框 -->
		<el-dialog
			title="修改密碼"
			:visible.sync="showUpdateDialog"
			width="30%">
			<el-form ref="form" :model="updatePasswordForm" label-width="70px">
				<el-form-item label="新密碼">
					<el-tooltip class="item" effect="dark" content="請輸入至少6位數" placement="bottom-start">
						<el-input v-model="updatePasswordForm.newPassword"></el-input>
					</el-tooltip>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showUpdateDialog = false">取消</el-button>
				<el-button type="primary" @click="updatePassword()">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getAccountList,addAccount,changeActive,updatePassword } from "@/api/auth";


export default {
	name: "accountList",
	data() {
		return {
			loading: false,
			showAddDialog:false,
			showUpdateDialog:false,
			list: [],
			rowActive:{},
			headers:{
				UserName: {
					name: "帳號",
					sortable: false
				},
				NickName: {
					name: "暱稱",
					sortable: false
				},
				
				Create_At: {
					name: "創建日期",
					sortable: false
				},
				Update_At: {
					name: "更新日期",
					sortable: false
				},
				Active: {
					name: "狀態",
					sortable: false
				},
				changePassword: {
					name: "動作",
					sortable: false
				},
				note: {
					name: "備註",
					sortable: false
				},
				
			},
			newAccountForm: {
				account:"",
				password:"",
				nickname:""
			},
			updatePasswordForm: {
				newPassword:"",
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
						// console.log(this.list);
					}
			})
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD");
		},
		//新增帳號
		addAccount(){
			this.showAddDialog = false;
			addAccount({
				account: this.newAccountForm.account,
				password: this.newAccountForm.password,
				nickname: this.newAccountForm.nickname
			}).then(response => {
					this.getList();
					this.newAccountForm = {
						account: "",
						password: "",
						nickname: ""
					};
					this.loading = false;
					this.$message({
						type: 'success',
						message: `建立成功`
					})
			}).catch(err => {
				this.loading = false;
				this.$message({
					type: 'warning',
					message: '建立失敗'
				})
			});
		},
		//狀態切換
		updateActive(row,value){
			this.$confirm(`是否確定 ${row.Active==1?'關閉':'啟用'} 帳號${row.UserName}的狀態?`, '提示', {
				confirmButtonText: '確定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				changeActive({
					"userId": row.UserId,
					"isActive": Number(value)
				}).then(response=>{
					this.getList()
				}).catch(err => {this.loading = false});
				this.$message({
					type: 'success',
					message: `成功 ${row.Active==1?'關閉':'啟用'} 帳號${row.UserName}狀態!`
				});
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消'
				});					
			});
		},
		showUpdate(row){
			this.showUpdateDialog=true;
			this.rowActive=row;
		},
		updatePassword(){
			this.$confirm(`是否確定更改帳號${this.rowActive.UserName}的密碼?`, '提示', {
					confirmButtonText: '確定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					if(this.updatePasswordForm.newPassword.length>=6){			
						updatePassword({
							userId: this.rowActive.UserId,
							newPwd: this.updatePasswordForm.newPassword
						}).then(response=>{
							console.log(response);
							this.getList()
						}).catch(err => {this.loading = false});
						this.updatePasswordForm.newPassword="";
						this.updatePasswordForm.confirmPassword="";
						this.showUpdateDialog=false;
						this.$message({
							type: 'success',
							message: `成功更改密碼!`
						})
					}else{
						this.$message({
							type: 'warning',
							message: '密碼輸入有誤，請重新輸入'
						})
					}
					
				})
			
		}
	
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
</style>