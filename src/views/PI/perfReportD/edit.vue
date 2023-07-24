<template>
	<div class="app-container perfReportD-Edit" v-loading="loading">
		<h2>日報表編輯</h2>
		<el-table 
		:data="list"
		empty-text="目前沒有資料"
		border
		fit
		:header-cell-style="{ 'background-color': '#F2F6FC' }"
		style="width: 100%"
		>
			<el-table-column
				type="index"
				label="序號"
				width="60"
				align="center">
			</el-table-column>
			<el-table-column
				label="項目"
				width="200">
				<template slot-scope="{ row }">
					{{ formatItem(row.perfItem, row.perfAtt) }}
				</template>
			</el-table-column>
			<el-table-column label="說明" >
				<template slot-scope="{ row }">
					{{ getDescription(row.perfItem, row.perfAtt) }}
				</template>
			</el-table-column>
			<el-table-column label="動作" align="center" width="100">
				<template slot-scope="{ row }">
					<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- <el-table 
		:data="pdfList"
		empty-text="目前沒有資料"
		border
		fit
		:header-cell-style="{ 'background-color': '#F2F6FC' }"
		style="width: 100%"
		>
			<el-table-column
				type="index"
				label="序號"
				width="60"
				align="center">
			</el-table-column>
			<el-table-column
				prop="pdfPage"
				label="項目"
				width="200">
			</el-table-column>
			<el-table-column
				prop="name"
				label="說明">
			</el-table-column>
			<el-table-column label="動作" align="center" width="100">
				<template slot-scope="{ row }">
					<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
				</template>
			</el-table-column>
		</el-table> -->
	</div>
</template>

<script>
import { getPerfReportList } from "@/api/PI";

export default {
	name: "perfReportDEdit",
	components: { },
	data() {
		return {
			loading: false,
			list:[],
			itemMap:{
				201:{
					0: "PI2.1",
					1: "PI2.1附件",
					2: "PI2.1附件(通報)",
				},
				301:{
					0: "PI3.1",
					1: "PI3.1附件",
				},
			}
			// pdfList:[
			// 	{pdfPage:'PI2.1',name:'登錄「道路管理資訊系統」資料之即時性',editDate:''},
			// 	{pdfPage:'PI2.1附件',name:'',editDate:''},
			// 	{pdfPage:'PI2.1附件(通報)',name:'當日被通報案件、當日廠商判定不合理案件',editDate:''},
			// 	{pdfPage:'PI3.1',name:'執行巡查與維護工作之安全性',editDate:''},
			// 	{pdfPage:'PI3.1附件',name:'',editDate:''},
			// ],
		};
	},
	computed: { },
	watch: {},
	mounted() {
		const row = this.$route.query.row;
		console.log(row);
		this.getList(row.id);
	},
	methods: {
		getList(id){
			getPerfReportList({
				reportId: id
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
		formatItem(perfItem, perfAtt) {
			const itemText = this.itemMap[perfItem]?.[perfAtt];
			// 如果找不到對應的值，返回空字符串或其他預設值
			return itemText || "";
		},
		getDescription(perfItem, perfAtt){
			const itemText = this.itemMap[perfItem]?.[perfAtt];
			switch (itemText) {
				case "PI2.1":
					return '登錄「道路管理資訊系統」資料之即時性';
				case "PI2.1附件":
					return ''
				case "PI2.1附件(通報)":
					return '當日被通報案件、當日廠商判定不合理案件'
				case "PI3.1":
					return '執行巡查與維護工作之安全性';
				case "PI3.1附件":
					return '';
				default:
					return '';
			}
		},
		beforeEdit(row) {
			let path = '';
			if (row.perfItem === 201) {
				if (row.perfAtt === 0) {
					path = "/PIIndex/perfReportD/PI2_1";
				} else if (row.perfAtt === 1) {
					path = "/PIIndex/perfReportD/PI2_1_Att";
				} else if (row.perfAtt === 2) {
					path = "/PIIndex/perfReportD/PI2_1_Att_2";
				}
			} else if (row.perfItem === 301) {
				if (row.perfAtt === 0) {
					path = "/PIIndex/perfReportD/PI3_1";
				} else if (row.perfAtt === 1) {
					path = "/PIIndex/perfReportD/PI3_1_Att";
				}
			}

			if (path !== '') {
				this.$router.push({ path, query: { row } });
			}
		}
	}
};
</script>

<style lang="sass">
</style>