<template>
	<div class="app-container">
		<h2>保固案件</h2>
		<el-table
 		:data="newlist"
 		border
		:header-cell-style="{'background-color': '#F2F6FC'}"
 		style="width: 100%">
 			<el-table-column
 				v-for="(value, key) in headersFilter"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:sortable="value.sortable"
				:width="value.width">
 			</el-table-column>
 		</el-table>
  </div>
</template>

<script>
import { getCaseWarrantyList } from "@/api/PI";


export default {
	name: "caseWarrantyList",
	data() {
		return {
			loading: false,
			list: [],
			newlist:[],
			headers: {
				id: {
					name: "編號",
					sortable: false,
					width:80
				},
				UploadCaseNo: {
					name: "案件案號",
					sortable: false,
					width:150
				},
				Place: {
					name: "查報地點",
					sortable: false,
					width:400
				},
				DateDeadline: {
					name: "預計完工日期",
					sortable: false
				},
				DateCompleted: {
					name: "實際完工日期",
					sortable: false
				},
				DateWarranty: {
					name: "保固日期",
					sortable: false
				},
				// DistressType: {
				// 	name: "項目",
				// 	sortable: false,
				// 	width:100
				// },
			}
		};
	},
	computed: {
		headersFilter() {
			let headersFilter = {};
			Object.keys(this.headers).forEach(key => {
				const props = this.headers[key];
				headersFilter[key] = props;
			})
			return headersFilter
		},
		
		
	},
	mounted() {
		this.getList();
	},
	methods: {
		getList() {
			this.loading = true;

			this.list = [];
			this.newlist = [];
			getCaseWarrantyList().then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
					// console.log(this.list)
					this.newlist = JSON.parse(JSON.stringify(this.list));
					
					this.computedDateWarranty();
					this.formatDateDeadline();
					this.formatDateCompleted();
					
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},	
		
		formatDateCompleted(){
			for(const val in this.newlist){
				// 將ISO時間戳記轉換為Date對象
				const date = new Date(Date.parse(this.newlist[val].DateCompleted));
				// 設置Date對象的時區為UTC
				const year = date.getUTCFullYear() - 1911;
				const month = date.getUTCMonth() + 1;
				const day = date.getUTCDate();
				const hour = date.getUTCHours().toString().padStart(2, '0');
				const minute = date.getUTCMinutes().toString().padStart(2, '0');
				this.newlist[val].DateCompleted = `${year}/${month}/${day} ${hour}:${minute}`
			}
		},
		formatDateDeadline(){
			for(const val in this.newlist){
				const date = new Date(Date.parse(this.list[val].DateDeadline));
				const year = date.getUTCFullYear() - 1911;
				const month = date.getUTCMonth() + 1;
				const day = date.getUTCDate();
				const hour = date.getUTCHours().toString().padStart(2, '0');
				const minute = date.getUTCMinutes().toString().padStart(2, '0');
				this.newlist[val].DateDeadline = `${year}/${month}/${day} ${hour}:${minute}`
			}
		},
		computedDateWarranty(){
			
			for(const val in this.newlist){
				if(this.newlist[val].DistressType=="坑洞"||this.newlist[val].DistressType=="人孔高差"||this.newlist[val].DistressType=="人行道"){
					const date = new Date(Date.parse(this.newlist[val].DateCompleted));
					date.setUTCDate(date.getUTCDate() + 13);
					const year = date.getUTCFullYear() - 1911;
					const month = date.getUTCMonth() + 1;
					const day = date.getUTCDate();
					this.newlist[val].DateWarranty = `${year}/${month}/${day}`
				}else {
					const date = new Date(Date.parse(this.newlist[val].DateCompleted));
					date.setUTCDate(date.getUTCDate() + 179);
					const year = date.getUTCFullYear() - 1911;
					const month = date.getUTCMonth() + 1;
					const day = date.getUTCDate();
					this.newlist[val].DateWarranty = `${year}/${month}/${day}`
				}
				
			}
		}
	},
};
</script>

<style lang="sass">


</style>