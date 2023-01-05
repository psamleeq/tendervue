<template>
	<div class="app-container PCI-Manager" v-loading="loading">
		<h2>PCI管理</h2>
		<div class="filter-container">
			<div class="filter-item">
				<div class="filter-item">
					<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
						<div class="el-input-group__prepend">
							<span>合約</span>
						</div>
						<el-select v-model="listQuery.tenderId" class="dteam-select" placeholder="請選擇" popper-class="type-select">
							<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
						</el-select>
					</div>
				</div>
			</div>
			<el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 20px" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
		</div>

		<el-table
			empty-text="目前沒有資料"
			:data="list"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
		>
			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:width="key == 'round' ? 60 : null "
				:formatter="formatter"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'roundStart', 'roundEnd' ].includes(column.property) && row.edit">
						<el-date-picker v-model="row[column.property]" type="date" value-format="yyyy-MM-dd" placeholder="選擇日期" style="width: 80%" />
						<!-- <el-input v-model="row[column.property]" size="mini" style="width: 100px" /> -->
						<el-button type="text" @click="row.edit = false; setRoundTime(row);">
							<i class="el-icon-success" />
						</el-button>
						<el-button type="text" @click="row.edit = false; getList();">
							<i class="el-icon-error" />
						</el-button>
					</span>
					<span v-else>{{ formatter(row, column) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="即時運算" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="primary" plain @click="calPCI(row.roundStart, row.roundEnd)">重新計算</el-button>
					<el-button class="btn-action" type="info" plain @click="removeBlock()">排除運算</el-button>
				</template>
			</el-table-column>

			<el-table-column label="區塊重算" align="center">
				<template slot-scope="{ row }">
					<el-row>
						<el-col :span="16">
							<el-input v-model="row.blockId" />
						</el-col>
						<el-col :span="8" style="height: 36px">
							<el-button class="btn-action" type="primary" plain style="margin: 5px" @click="calPCISpec(row.blockId, row.roundStart, row.roundEnd)">重算</el-button>
						</el-col>
					</el-row>
				</template>
			</el-table-column>

			<el-table-column label="操作" width="150" align="center">
				<template slot-scope="{ row }">
					<el-button v-if="!row.edit" class="btn-action" type="primary" plain @click="row.edit = true">編輯</el-button>
					<el-button v-else type="info" class="btn-action" @click="row.edit = false; getList();">取消</el-button>
					<!-- <el-button type="danger" class="btn-action" @click=" rowActive = row; showConfirm = true;">刪除</el-button> -->
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderMap, getTenderRound, setTenderRound } from "@/api/type";
import { resetPCI, updatePCI, verifyPCI } from "@/api/tool";

export default {
	name: "PCIManager",
	data() {
		return {
			loading: false,
			dialogMapVisible: true,
			timeTabId: 1,
			dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			listQuery: {
				tenderId: null,
				blockId: null
			},
			headers: {
				round: {
					name: "回合",
					sortable: false
				},
				roundStart: {
					name: "起始時間",
					sortable: false
				},
				roundEnd: {
					name: "結束時間",
					sortable: false
				}
			},
			list: [],
			options: { 
				tenderMap: {}
			}
		};
	},
	computed: {},
	watch: {},
	created() {
		getTenderMap().then(response => {
			this.options.tenderMap = response.data.tenderMap;
			if(Object.keys(this.options.tenderMap).length > 0) {
				this.listQuery.tenderId = Object.keys(this.options.tenderMap)[0];
				this.getList();
			}
		});
	},
	mounted(){
		this.dialogMapVisible = false;
	},
	methods: {
		getList() {
			this.loading = true;
			this.list = [];

			getTenderRound({ tenderId: this.listQuery.tenderId }).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
					this.total = 0;
				} else {
					this.list = response.data.list;
					this.list.forEach(l => {
						l.roundStart = this.formatTime(l.roundStart);
						l.roundEnd = this.formatTime(l.roundEnd);
						this.$set(l, "blockId", "");
						this.$set(l, "edit", false);
					});
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		setRoundTime(row) {
			this.$confirm(`確定修改Round${row.round}的區間為${row.roundStart} - ${row.roundEnd}?`, "確認", {
					showClose: false,
				}).then(() => {
				setTenderRound( row.id, { timeStart: row.roundStart, timeEnd: row.roundEnd } ).then(response => {
					if (response.statusCode == 20000 ) {
						this.$message({
							message: "修改成功",
							type: "success",
						});
						this.getList();
					} 
				}).catch(err => {
					console.log(err);
					this.getList();
				});
			})
		},
		calPCI(timeStart, timeEnd) {
			resetPCI({ timeStart, timeEnd }).then(response => {
				if (response.statusCode == 20000 ) {
					this.$message({
						message: "重置成功",
						type: "success",
					});
				} 
			}).catch(err => console.log(err));
		},
		removeBlock() {
			verifyPCI().then(response => {
				if (response.statusCode == 20000 ) {
					this.$message({
						message: "排除成功",
						type: "success",
					});
				} 
			}).catch(err => console.log(err));
		},
		calPCISpec(blockId, timeStart, timeEnd) {
			if(!Number(blockId)) {
				this.$message({
					message: "請輸入正確區塊Id",
					type: "error",
				});
				blockId = "";
			} else {
				updatePCI({ blockId, timeStart, timeEnd }).then(response => {
					if (response.statusCode == 20000 ) {
						this.$message({
							message: "重算成功",
							type: "success",
						});
					} 
				}).catch(err => console.log(err))
			}
		},
		formatter(row, column) {
			if (Number(row[column.property])) return row[column.property].toLocaleString();
			else return row[column.property] || "-";
		},
		formatTime(time) {
			return moment(time).utc().format("YYYY-MM-DD");
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.type-select .el-select-dropdown__item
	padding: 0 5px
	text-align: center
.PCI-Manager
	.filter-container .filter-item .select-contract .el-select
		&.dteam-select
			width: 520px
		.el-input__inner
			border-top-left-radius: 0
			border-bottom-left-radius: 0
			padding-left: 10px
			text-align: left
	.btn-action
		margin-left: 5px
		padding: 5px
	.el-table
		.el-icon-success
			margin-right: -10px
		.el-icon-error
			color: #F56C6C
</style>