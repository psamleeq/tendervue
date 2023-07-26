<template>
	<div class="app-container perfReportD-Edit" v-loading="loading">
		<h2>{{ options.reportTypeMap[reportInfo.reportType] }} - 編輯</h2>
		<el-button type="info" size="mini" style="margin-bottom: 12px" @click="handlePageTurn()">返回</el-button>
		<aside>
			<div>區域: {{ options.districtList[reportInfo.zipCode].name }}</div>
			<div>報告日期: {{ reportInfo.reportDate }}</div>
		</aside>
		<el-table 
			:data="list"
			empty-text="目前沒有資料"
			border
			fit
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%"
		>
			<el-table-column type="index" label="序號" width="60" align="center" />
			<el-table-column label="項目" width="200" align="center">
				<template slot-scope="{ row }">
					{{ formatItem(row.perfItem, row.perfAtt) }}
				</template>
			</el-table-column>
			<el-table-column label="說明" align="center">
				<template slot-scope="{ row }">
					{{ getDescription(row.perfItem, row.perfAtt) }}
				</template>
			</el-table-column>
			<el-table-column label="頁數" align="center">
				<template slot-scope="{ row }">
					{{ row.content.pageCount ? row.content.pageCount : "-" }}
				</template>
			</el-table-column>
			<el-table-column label="完成" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.IsFinished" style="color: #67C23A"> V </span>
					<span v-else style="color: #F56C6C"> X </span>
				</template>
			</el-table-column>
			<el-table-column label="動作" width="100" align="center">
				<template slot-scope="{ row }">
					<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import moment from "moment";
import { getPerfReportList } from "@/api/PI";

export default {
	name: "perfReportDEdit",
	components: { },
	data() {
		return {
			loading: false,
			listQuery: {
				reportId: 0
			},
			reportInfo: {
				zipCode: 104
			},
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
			},
			// pdfList:[
			// 	{pdfPage:'PI2.1',name:'登錄「道路管理資訊系統」資料之即時性',editDate:''},
			// 	{pdfPage:'PI2.1附件',name:'',editDate:''},
			// 	{pdfPage:'PI2.1附件(通報)',name:'當日被通報案件、當日廠商判定不合理案件',editDate:''},
			// 	{pdfPage:'PI3.1',name:'執行巡查與維護工作之安全性',editDate:''},
			// 	{pdfPage:'PI3.1附件',name:'',editDate:''},
			// ],
			options: {
				districtList: {
					// 100: {
					// 	"name": "中正區"
					// },
					103: {
						"name": "大同區"
					},
					104: {
						"name": "中山區"
					},
					// 105: {
					// 	"name": "松山區"
					// },
					// 106: {
					// 	"name": "大安區"
					// },
					// 108: {
					// 	"name": "萬華區"
					// },
					// 110: {
					// 	"name": "信義區"
					// },
					// 111: {
					// 	"name": "士林區"
					// },
					// 112: {
					// 	"name": "北投區"
					// },
					// 114: {
					// 	"name": "內湖區"
					// },
					// 115: {
					// 	"name": "南港區"
					// },
					// 116: {
					// 	"name": "文山區"
					// }
				},
				reportTypeMap: {
					1: "日報表",
					2: "週報表",
					3: "月報表"
				}
			}
		};
	},
	computed: { },
	watch: {},
	created() {
		if(this.$route.query.reportId) {
			this.listQuery.reportId = this.$route.query.reportId;
			this.getList();
		} else this.$router.push({ path: "/PIIndex/perfReportD/list" });
	},
	mounted() { },
	methods: {
		getList(){
			this.loading = true;
			this.list = [];
			
			getPerfReportList({
				reportId: this.listQuery.reportId
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
					this.reportInfo = response.data.reportInfo;
					this.reportInfo.reportDate = moment(this.reportInfo.reportDate).format("YYYY-MM-DD")
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
				this.$router.push({ path, query: { reportId: this.listQuery.reportId, contentId: row.id, cidList: this.list.map(l => l.id).join(",") } });
			}
		},
		handlePageTurn() {
			this.$router.push({
				path: "/PIIndex/perfReportD/list",
			})
		}
	}
};
</script>

<style lang="sass">
</style>