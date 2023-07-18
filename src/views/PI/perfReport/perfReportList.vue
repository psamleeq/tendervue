<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>日報表編輯列表</h2>
			<el-table 
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
					label="Pdf頁面">
				</el-table-column>
				<el-table-column
					prop="name"
					label="編輯人員">
				</el-table-column>
				<el-table-column
					prop="editDate"
					label="編輯日期">
				</el-table-column>
				<el-table-column label="動作" align="center">
					<template slot-scope="{ row }">
						<el-button type="success" plain size="mini" @click="beforeEdit(row)"><i class="el-icon-edit"></i>編輯</el-button>
					</template>
				</el-table-column>
			</el-table>
	</div>
</template>

<script>

export default {
	name: "perfReportList",
	components: { },
	data() {
		return {
			loading: false,
			pdfList:[
				{pdfPage:'PI2.1',name:'',editDate:''},
				{pdfPage:'PI2.1附件',name:'',editDate:''},
				{pdfPage:'PI2.1附件(通報)',name:'',editDate:''},
				{pdfPage:'PI3.1',name:'',editDate:''},
				{pdfPage:'PI3.1附件',name:'',editDate:''},
			],
		};
	},
	computed: { },
	watch: {},
	mounted() {
		const row = this.$route.query.row;
		console.log(row);
	},
	methods: {
		beforeEdit(row){
			console.log(row);
			switch (row.pdfPage) {
				case "PI2.1":
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1",
						query: {  },
					})
					break;
				case "PI2.1附件":
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1_Att",
						query: {  },
					})
					break;
				case "PI2.1附件(通報)":
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1_Att_2",
						query: {  },
					})
					break;
				case "PI3.1":
					this.$router.push({
						path: "/PIIndex/perfReportD/PI3_1",
						query: {  },
					})
					break;
				case "PI3.1附件":
					this.$router.push({
						path: "/PIIndex/perfReportD/PI3_1_Att",
						query: {  },
					})
					break;
				default:
					break;
			}
			row.pdfPage
		}
	}
};
</script>

<style lang="sass">
</style>