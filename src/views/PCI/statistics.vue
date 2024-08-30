<template>
	<div class="app-container contract" v-loading="loading">
		<h2>合約統計</h2>
		<div class="filter-container">
			<div class="filter-item">
				<div class="filter-item">
					<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
						<div class="el-input-group__prepend">
							<span>合約</span>
						</div>
						<el-select v-model.number="listQuery.tenderId" class="tender-select" placeholder="請選擇" popper-class="type-select tender" @change="listQuery.pageCurrent = 1; getList();">
							<el-option v-for="(obj, id) in options.tenderMap" :key="id" :value="Number(id)" :label="obj.tenderName" />
						</el-select>
						
					</div>
				</div>
				<el-button class="btn-action" style="float: right" type="primary" @click="exportAllAverage()" plain>全行政區總平均</el-button>
			</div>
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
				:min-width="key == 'round' ? 60 : ['title', 'roundStart', 'roundEnd'].includes(key) ? 100 : null"
				:formatter="formatter"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'title', 'roundStart', 'roundEnd' ].includes(column.property) && row.edit">
						<el-date-picker v-if="[ 'roundStart', 'roundEnd' ].includes(column.property)" v-model="row[column.property]" type="date" size="mini" value-format="yyyy-MM-dd" placeholder="選擇日期" style="width: 134px" />
						<el-input v-else-if="[ 'title' ].includes(column.property)" v-model="row[column.property]" size="mini" style="width: 134px" />
						<el-button type="text" @click="row.edit = false; setRound(row);">
							<i class="el-icon-success" />
						</el-button>
						<el-button type="text" @click="row.edit = false; getList();">
							<i class="el-icon-error" />
						</el-button>
					</span>
					<span v-else>{{ formatter(row, column) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="300" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
            <el-button v-if="row.tenderId > 1000" class="btn-action" type="warning" @click="exportPCI(row)" plain>PCI數據</el-button>
            <el-button class="btn-action" type="success" @click="exportDistressType(row)" plain>缺失類型</el-button>
            <el-button class="btn-action" type="danger" @click="exportRoadAverage(row)" plain>道路PCI平均</el-button>
          </el-button-group>
				</template>
			</el-table-column>
		</el-table>

	</div>
</template>

<script>
import moment from "moment";
import { getTenderMap, getTenderRound } from "@/api/type";
import { getPCIScore, getDistressStatistics, getRoadAverage, getAllAverage } from "@/api/pci";
import checkPermission from '@/utils/permission';
import XLSX from 'xlsx';

export default {
	name: "contract",
	data() {
		return {
			loading: false,
			isUpload: false,
			showAddDialog: false,
			dialogType: 1,
			surveyId: 0,
			tenderId: 0,
			screenWidth: window.innerWidth,
			listQuery: {
				tenderId: 100,
				blockId: null
			},
			headers: {
				id: {
					name: 'SurveyId',
					sortable: false
				},
				tenderId: {
					name: 'TenderId',
					sortable: false
				},
				round: {
					name: "輪次",
					sortable: false
				},
				title: {
					name: "標題",
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
			newRoundForm: {
				round: "",
				title: "",
				roundStart: "",
				roundEnd: ""
			},
			options: { 
				tenderMap: {}
			}
		};
	},
	computed: {
		dialogTitle() {
			return this.dialogType === 1 ? '新增' : '複製';
		}
	},
	watch: {},
	created() {
		getTenderMap().then(response => {
			this.options.tenderMap = response.data.tenderMap;
			if(Object.keys(this.options.tenderMap).length > 0) {
				if(!Object.keys(this.options.tenderMap).includes(String(this.listQuery.tenderId))) this.listQuery.tenderId = Object.keys(this.options.tenderMap)[0];
				this.getList();
			}
		});
	},
	mounted(){ },
	methods: {
		checkPermission,
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
					this.newRoundForm.round = 1;
				} else {
					this.list = response.data.list;

					this.newRoundForm = {
						round: Math.max(...this.list.map(l => l.round)) + 1,
						title: "",
						roundStart: "",
						roundEnd: ""
					}
					
					this.list.forEach(l => {
						l.roundStart = this.formatTime(l.roundStart);
						l.roundEnd = this.formatTime(l.roundEnd);
						this.$set(l, "blockId", "");
						this.$set(l, "roadName", "");
						this.$set(l, "edit", false);
					});

				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		
		handleData(row) {
			this.tenderId = row.tenderId;
			this.surveyId = row.id;
			this.dialogType = 2;
			this.showAddDialog = true;
		},
		importCaseDistress() {
			this.loading = true;
			importCaseDistressCopy({ 
				surveyId: this.surveyId,
				tenderId: this.tenderId,
				title: this.newRoundForm.title,
				round: this.newRoundForm.round,
				roundStart: this.newRoundForm.roundStart,
				roundEnd: this.newRoundForm.roundEnd
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					const result = response.result;
					this.$message({
						message: `上傳缺失結果(共 ${result.total}件): 成功 ${result.success}件`,
						type: "success",
					});
				} 
				this.getList();
				this.showAddDialog = false;
				this.loading = false;
			}).catch(err => {
				console.log(err);
				this.loading = false;
			})
		},
		exportPCI(row) {
			// console.log(row);
			getPCIScore({ block: `block_${row.tenderId}` }).then(response => {

				if (response.data.list.length != 0) {
					const table = [];
					table.push(['PCI', '單元維護數', '路段數']);
					table.push(['很好 (85-100)', `${response.data.list[0]["veryGood(85-100)"]}(${response.data.list[1]["veryGood(85-100)"]}%)`, `${response.data.list2[0]["veryGood(85-100)"]}(${response.data.list2[1]["veryGood(85-100)"]}%)`]);
					table.push(['好 (70-85)', `${response.data.list[0]["good(70-85)"]}(${response.data.list[1]["good(70-85)"]}%)`, `${response.data.list2[0]["good(70-85)"]}(${response.data.list2[1]["good(70-85)"]}%)`]);
					table.push(['尚可 (55-70)', `${response.data.list[0]["fair(55-70)"]}(${response.data.list[1]["fair(55-70)"]}%)`, `${response.data.list2[0]["fair(55-70)"]}(${response.data.list2[1]["fair(55-70)"]}%)`]);
					table.push(['差 (40-55)', `${response.data.list[0]["poor(40-55)"]}(${response.data.list[1]["poor(40-55)"]}%)`, `${response.data.list2[0]["poor(40-55)"]}(${response.data.list2[1]["poor(40-55)"]}%)`]);
					table.push(['很差 (25-40)', `${response.data.list[0]["veryPoor(25-40)"]}(${response.data.list[1]["veryPoor(25-40)"]}%)`, `${response.data.list2[0]["veryPoor(25-40)"]}(${response.data.list2[1]["veryPoor(25-40)"]}%)`]);
					table.push(['嚴重 (10-25)', `${response.data.list[0]["serious(10-25)"]}(${response.data.list[1]["serious(10-25)"]}%)`, `${response.data.list2[0]["serious(10-25)"]}(${response.data.list2[1]["serious(10-25)"]}%)`]);
					table.push(['不合格 (0-10)', `${response.data.list[0]["failed(0-10)"]}(${response.data.list[1]["failed(0-10)"]}%)`, `${response.data.list2[0]["failed(0-10)"]}(${response.data.list2[1]["failed(0-10)"]}%)`]);
					// console.log(table);

					// 將數據轉換為 Excel 兼容格式
					const worksheet = XLSX.utils.aoa_to_sheet(table);
					// 創建 Excel 工作簿
					const workbook = XLSX.utils.book_new();
					// 將工作表添加到工作簿中
					XLSX.utils.book_append_sheet(workbook, worksheet, 'PCI數據');
					// 生成 Excel 文件的二進制字符串
					const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

					// 創建 Blob 並觸發文件下載
					const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `PCI數據統計-${row.tenderName}.xlsx`;
					link.click();

					this.$message({
						message: '資料匯出成功',
						type: 'success'
					});
				} else {
					this.$message({
						message: '沒資料唷',
						type: 'warning'
					});
				}
			}).catch(err => {
				console.log(err);
			})
		},
		exportDistressType(row) {
			// console.log(row.id);
			getDistressStatistics({ surveyId: row.id }).then(response => {
				if (response.data.list.length != 0) {
					// console.log(response.data.list);

					// 將數據轉換為 Excel 兼容格式
					const worksheet = XLSX.utils.json_to_sheet(response.data.list);
					// 創建 Excel 工作簿
					const workbook = XLSX.utils.book_new();
					// 將工作表添加到工作簿中
					XLSX.utils.book_append_sheet(workbook, worksheet, '缺失類型統計');
					// 生成 Excel 文件的二進制字符串
					const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

					// 創建 Blob 並觸發文件下載
					const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `調查缺失類型統計-${row.tenderName}.xlsx`;
					link.click();

					this.$message({
						message: '資料匯出成功',
						type: 'success'
					});
				} else {
					this.$message({
						message: '沒資料唷',
						type: 'warning'
					});
				}
			}).catch(err => {
				console.log(err);
			});
		},
		exportRoadAverage(row) {
			// console.log(row);
			getRoadAverage({ block: `block_${row.tenderId}` }).then(response => {
				if (response.data.list.length != 0) {
					const list = response.data.list;
					const list2 = response.data.list2;
					const table = [];
					table.push(['道路名稱', '平均PCI']);
					for (let i = 0; i < list.length; i++) {
						table.push([list[i]["道路名稱"], list[i]["average"]]);
					}
					table.push(['------', '------']);
					table.push(['區域平均PCI', list2[0].overall_average]);
					console.log(table);

					// 將數據轉換為 Excel 兼容格式
					const worksheet = XLSX.utils.aoa_to_sheet(table);
					// 創建 Excel 工作簿
					const workbook = XLSX.utils.book_new();
					// 將工作表添加到工作簿中
					XLSX.utils.book_append_sheet(workbook, worksheet, '道路平均統計');
					// 生成 Excel 文件的二進制字符串
					const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

					// 創建 Blob 並觸發文件下載
					const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `道路平均統計-${row.tenderName}.xlsx`;
					link.click();

					this.$message({
						message: '資料匯出成功',
						type: 'success'
					});
				} else {
					this.$message({
						message: '沒資料唷',
						type: 'warning'
					});
				}
			}).catch(err => {
				console.log(err);
			});
		},
		exportAllAverage() {
			getAllAverage().then(response => {
				const list = response.data.list;
				const table = [];
				let overall_average = 0; // 總平均計算
				table.push(['區域名稱', 'PCI平均分數']);
				
				for (let i = 0; i < list.length; i++) {
					table.push([list[i].area, list[i].average_pci]);
					overall_average += list[i].average_pci;
				}
				
				overall_average /= 12; // 總共12個區域
				table.push(['總平均', overall_average]);
				// console.log(table);

				// 將數據轉換為 Excel 兼容格式
				const worksheet = XLSX.utils.aoa_to_sheet(table);
				// 創建 Excel 工作簿
				const workbook = XLSX.utils.book_new();
				// 將工作表添加到工作簿中
				XLSX.utils.book_append_sheet(workbook, worksheet, '行政區PCI平均統計');
				// 生成 Excel 文件的二進制字符串
				const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

				// 創建 Blob 並觸發文件下載
				const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `全部行政區PCI平均統計.xlsx`;
				link.click();

				this.$message({
					message: '資料匯出成功',
					type: 'success'
				});
			});
			
		},
		formatter(row, column) {
			if (Number(row[column.property])) return row[column.property];
			else return row[column.property] || "-";
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD");
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.contract
	.filter-container .filter-item .select-contract .el-select
		&.tender-select
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
		thead.is-group th
			padding: 5px 0
		.el-icon-success
			margin-right: -10px
		.el-icon-error
			color: #F56C6C
</style>