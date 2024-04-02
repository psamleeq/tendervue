<template>
	<div class="app-container case-apply-manage" v-loading="loading">
		<h2>申請單管理</h2>
		<div class="filter-container">
			<!-- <div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>類型</span>
					</div>
					<el-select v-model.number="listQuery.deviceType" placeholder="請選擇" popper-class="type-select"
						style="width: 100px">
						<el-option v-for="(name, id) in options.deviceType" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>
			<br> -->

			<!-- <span class="filter-item">
				<div style="font-size: 12px; color: #909399">建單日期</div>
				<time-picker shortcutType="year" :timeTabId.sync="timeTabId" :dateRange.sync="dateRange" @search="getList" />
			</span> -->
			<div class="filter-item">
				<el-input v-model="listQuery.filterStr" placeholder="請輸入" style="width: 300px">
					<span slot="prepend">申請單號</span>
				</el-input>
			</div>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
		</div>

		<h5 v-if="list.length != 0 && (!listQuery.filterStr || listQuery.filterStr.length == 0)">查詢期間：{{ searchRange }}</h5>

		<el-table empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%">

			<el-table-column v-for="(value, key) in headers" :key="key" :prop="key" :label="value.name" align="center"
				min-width="30" :sortable="value.sortable">
				<template slot-scope="{ row, column }">
					<span v-if="[ 'CaseNoArr' ].includes(column.property)">
						<span v-if="row.CaseNoArr.length != 0">
							<span>{{ row.CaseNoArr.length }}</span>
							<el-tooltip effect="dark" placement="bottom">
								<span slot="content">
									<div v-for="(caseNo, index) in row.CaseNoArr" :key="`${caseNo}_${index}`">{{ caseNo }}</div>
									<!-- <div v-for="caseNo in row.CaseNoInActiveArr" :key="caseNo">{{ caseNo }}<span
											style="color: #F56C6C">(退回)</span></div> -->
								</span>
								<i class="icon-tooltip el-icon-warning" />
							</el-tooltip>
						</span>
						<span v-else> - </span>
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>

			<!-- <el-table-column label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="success" plain size="mini"
						@click="editJobTicket(row)">編輯</el-button>
					<el-button class="btn-action" type="info" size="mini"
						@click="reissueJobTicket(row)">補印申請單</el-button>
				</template>
			</el-table-column> -->
		</el-table>

		<apply-ticket-pdf ref="applyTicketPdf" style="display: none" :loading.sync="loading" :tableSelect.sync="caseSpec" />

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize"
			@pagination="getList" />
	</div>
</template>

<script>
import moment from "moment";
import checkPermission from '@/utils/permission';
import { getApplyTicketList, getJobTicketSpec } from "@/api/dispatch";
import Pagination from "@/components/Pagination";
import ApplyTicketPdf from "@/components/ApplyTicketPdf";

export default {
	name: "caseApplyManage",
	components: { ApplyTicketPdf },
	data() {
		return {
			loading: false,
			screenWidth: window.innerWidth,
			// timeTabId: 2,
			// dateRange: [
			// 	moment().startOf("month").toDate(),
			// 	moment().endOf("day").toDate(),
			// ],
			searchRange: "",
			listQuery: {
				filterStr: null,
				deviceType: 1,
				pageCurrent: 1,
				pageSize: 50
			},
			headers: {
				CaseSN: {
					name: "申請單號",
					sortable: true
				},
				// OrderType: {
				// 	name: "維護類型",
				// 	sortable: false
				// },
				CaseNoArr: {
					name: "案件數量",
					sortable: false
				},
				// Creater: {
				// 	name: "建單人員",
				// 	sortable: false
				// },
				// DateAssign: {
				// 	name: "建單時間",
				// 	sortable: false
				// }
			},
			total: 0,
			list: [],
			// detail: [],
			caseSpec: {}
		};
	},
	computed: { },
	watch: {
		"pdfSetting.fontSize"() {
			this.pdfSetting.lineHeight = (this.pdfSetting.fontSize + 2) * 0.35;
		}
	},
	created() {  },
	mounted() { },
	methods: {
		checkPermission,
		getList(showMsg = true) {
			this.loading = true;
			this.list = [];

			getApplyTicketList({
				caseSN: this.listQuery.filterStr,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize
			}).then(response => {
				if (response.data.list.length == 0) {
					if(showMsg) this.$message({
						message: "查無資料",
						type: "error",
					});
					this.total = 0;
				} else {
					this.list = response.data.list;
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		formatDate(time) {
			return time ? moment(time).format("YYYY-MM-DD"): "";
		},
		editJobTicket(row) {
			this.$router.push({
				name: "jobTicketEdit",
				params: { orderSN: row.OrderSN },
			});
		},
		reissueJobTicket(row) {
			// console.log(row);
			getJobTicketSpec({
				dispatchSN: row.OrderSN,
				deviceType: this.listQuery.deviceType
			}).then(async(response) => {
				this.caseSpec.splice(0, this.caseSpec.length, ...response.data.list);

				this.caseSpec.forEach((l, i) => {
					for (const col of ['MillingDepth', 'MillingLength', 'MillingWidth', 'MillingArea']) 
						if(Number(l[col])) l[col] = Math.round(l[col] * 1000) / 1000;
				});
				this.$refs.applyTicketPdf.imgPreload(this.caseSpec);

				switch(this.deviceTypeNow) {
					case 1:
						this.caseSpec.forEach((l, i) => {
							l.tonne = Math.round(l.MillingArea*l.MillingDepth*0.01*2.25*10) / 10;
						});
						this.$refs.applyTicketPdf.createPdf_AC(row.OrderSN).then(() => { this.$refs.applyTicketPdf.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });
						break;
					case 2:
						this.$refs.applyTicketPdf.createPdf_HR(row.OrderSN).then(() => { this.$refs.applyTicketPdf.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
					case 3:
						this.caseSpec.forEach((l, i) => {
							l.DatePlan = this.formatDate(l.DatePlan);
							l.DateDeadline = (l.DateDeadline == null) ? "" : this.formatDate(l.DateDeadline);
						});
						this.$refs.applyTicketPdf.createPdf_FA(row.OrderSN).then(() => { this.$refs.applyTicketPdf.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
					case 4:
						this.$refs.applyTicketPdf.createPdf_MK(row.OrderSN).then(() => { this.$refs.applyTicketPdf.pdfDoc.save(`維修派工單_${row.OrderSN}.pdf`) });	
						break;
				}
			}).catch(err => this.loading = false);
		},
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.case-apply-manage
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 110px
				.el-input__inner
					padding-left: 3px
					padding-right: 10px
					text-align: center
				.el-input__suffix
					right: 0
					// margin-right: -5px
					transform: scale(0.7)
				&.tender-select
					width: 520px
			.select-contract
				.el-select:first-child .el-input__inner
					background-color: #F5F7FA
					color: #909399
					border-right: none
					border-top-right-radius: 0
					border-bottom-right-radius: 0
					&:focus
						border-color: #DCDFE6
				.el-select:last-child .el-input__inner
					border-top-left-radius: 0
					border-bottom-left-radius: 0
					padding-left: 10px
					text-align: left
	.el-table
		.success-row 
			background: #F0F9EB
			&.hover-row > td
				background-color: initial !important
		.btn-action
			margin-left: 5px
			padding: 5px
	.btn-dialog
		padding: 5px 5px
	.el-dialog
		.el-dialog__body > div
			margin-top: 10px
		.el-select
			margin-top: 5px
			margin-bottom: 5px
			width: 250px
		.revokeReasonNote
			margin-top: 5px
			width: 250px
		.footer-btns
			display: flex
			justify-content: center
</style>
