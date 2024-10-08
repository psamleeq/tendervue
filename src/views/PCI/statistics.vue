<template>
	<div class="app-container contract" v-loading="loading">
		<h2>合約統計</h2>
		<div class="filter-container" style="display: flex; align-items: center;">
			<div class="filter-item" style="flex-grow: 1;">
				<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model.number="listQuery.tenderId" class="tender-select" placeholder="請選擇" popper-class="type-select tender" @change="listQuery.pageCurrent = 1; getList();">
						<el-option v-for="(obj, id) in options.tenderMap" :key="id" :value="Number(id)" :label="obj.tenderName" />
					</el-select>
				</div>
			</div>
			<el-button v-if="![52, 53, 54, 55, 56, 1042, 99999].includes(listQuery.tenderId)" type="warning" @click="fixCorrectGeoJson()" >修正地理格式</el-button>
		</div>

		<div style="margin-bottom: 10px;">
			<el-button type="primary" @click="exportAllAverage()">行政區PCI平均統計</el-button>
			<el-button type="success" @click="exportAllPCI()">PCI數據(8-30)</el-button>
			<el-button type="warning" @click="exportAllDistressType()">缺失類型數據(8-30)</el-button>
			<el-button type="danger" @click="exportAllRoadAverage()">道路PCI平均(8-30)</el-button>
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
            <el-button v-if="![52, 53, 54, 55, 56, 1042, 99999].includes(row.tenderId)" class="btn-action" type="warning" @click="exportPCI(row)" plain>PCI數據</el-button>
            <el-button class="btn-action" type="success" @click="exportDistressType(row)" plain>缺失類型</el-button>
            <el-button v-if="![52, 53, 54, 55, 56, 1042, 99999].includes(row.tenderId)" class="btn-action" type="danger" @click="exportRoadAverage(row)" plain>道路PCI平均</el-button>
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
import { updateCorrectGeoJson } from "@/api/tool";
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
		exportPCI(row) {
			// console.log(row);
			getPCIScore({ tenderId: row.tenderId }).then(response => {
				const list = response.data.list; // 單元維護數
				const list2 = response.data.list2; // 路段數

				if (list.length != 0) {
					const table = [];
					table.push(['PCI', '單元維護數', '路段數']);
					table.push(['很好 (85-100)', `${list[0]["veryGood(85-100)"]}(${list[1]["veryGood(85-100)"]}%)`, `${list2[0]["veryGood(85-100)"]}(${list2[1]["veryGood(85-100)"]}%)`]);
					table.push(['好 (70-85)', `${list[0]["good(70-85)"]}(${list[1]["good(70-85)"]}%)`, `${list2[0]["good(70-85)"]}(${list2[1]["good(70-85)"]}%)`]);
					table.push(['尚可 (55-70)', `${list[0]["fair(55-70)"]}(${list[1]["fair(55-70)"]}%)`, `${list2[0]["fair(55-70)"]}(${list2[1]["fair(55-70)"]}%)`]);
					table.push(['差 (40-55)', `${list[0]["poor(40-55)"]}(${list[1]["poor(40-55)"]}%)`, `${list2[0]["poor(40-55)"]}(${list2[1]["poor(40-55)"]}%)`]);
					table.push(['很差 (25-40)', `${list[0]["veryPoor(25-40)"]}(${list[1]["veryPoor(25-40)"]}%)`, `${list2[0]["veryPoor(25-40)"]}(${list2[1]["veryPoor(25-40)"]}%)`]);
					table.push(['嚴重 (10-25)', `${list[0]["serious(10-25)"]}(${list[1]["serious(10-25)"]}%)`, `${list2[0]["serious(10-25)"]}(${list2[1]["serious(10-25)"]}%)`]);
					table.push(['不合格 (0-10)', `${list[0]["failed(0-10)"]}(${list[1]["failed(0-10)"]}%)`, `${list2[0]["failed(0-10)"]}(${list2[1]["failed(0-10)"]}%)`]);
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
			getRoadAverage({ tenderId: row.tenderId }).then(response => {
				if (response.data.list.length != 0) {
					const list = response.data.list;
					const table = [];
					table.push(['道路名稱', '平均PCI']);
					for (let i = 0; i < list.length; i++) {
						table.push([list[i]["道路名稱"], list[i]["average"]]);
					}
					// console.log(table);

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
					table.push([list[i].area, Math.round(list[i].average_pci * 100) / 100]);
					overall_average += Math.round(list[i].average_pci * 100) / 100;
				}
				
				overall_average /= 12; // 總共12個區域
				table.push(['總平均', Math.round(overall_average * 100) / 100]);
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
				link.download = `行政區PCI平均統計.xlsx`;
				link.click();

				this.$message({
					message: '資料匯出成功',
					type: 'success'
				});
			});
			
		},
		exportAllPCI() {
			const tenderMap = {
				1002: '中正區(8-30)',
				1052: '松山區(8-30)',
				1062: '大安區(8-30)',
				1082: '萬華區(8-30)',
				1102: '信義區(8-30)',
				1112: '士林區(8-30)',
				1122: '北投區(8-30)',
				1142: '內湖區(8-30)',
				1152: '南港區(8-30)',
				1162: '文山區(8-30)',
				99921: '橋涵區1(8-30)',
				99922: '橋涵區2(8-30)'
			};

			// 創建一個空的 Excel 工作簿
			const workbook = XLSX.utils.book_new();

			// 遍歷 tenderMap 的所有 key
			const allTenderMap = Object.keys(tenderMap).map(tenderId => {
				// 為每個 tenderId 調用 getPCIScore 並返回 Promise
				return getPCIScore({ tenderId }).then(response => {
					const list = response.data.list; // 單元維護數
					const list2 = response.data.list2; // 路段數

					if (list.length != 0) {
						const table = [];
						table.push(['PCI', '單元維護數', '路段數']);
						table.push(['很好 (85-100)', `${list[0]["veryGood(85-100)"]}(${list[1]["veryGood(85-100)"]}%)`, `${list2[0]["veryGood(85-100)"]}(${list2[1]["veryGood(85-100)"]}%)`]);
						table.push(['好 (70-85)', `${list[0]["good(70-85)"]}(${list[1]["good(70-85)"]}%)`, `${list2[0]["good(70-85)"]}(${list2[1]["good(70-85)"]}%)`]);
						table.push(['尚可 (55-70)', `${list[0]["fair(55-70)"]}(${list[1]["fair(55-70)"]}%)`, `${list2[0]["fair(55-70)"]}(${list2[1]["fair(55-70)"]}%)`]);
						table.push(['差 (40-55)', `${list[0]["poor(40-55)"]}(${list[1]["poor(40-55)"]}%)`, `${list2[0]["poor(40-55)"]}(${list2[1]["poor(40-55)"]}%)`]);
						table.push(['很差 (25-40)', `${list[0]["veryPoor(25-40)"]}(${list[1]["veryPoor(25-40)"]}%)`, `${list2[0]["veryPoor(25-40)"]}(${list2[1]["veryPoor(25-40)"]}%)`]);
						table.push(['嚴重 (10-25)', `${list[0]["serious(10-25)"]}(${list[1]["serious(10-25)"]}%)`, `${list2[0]["serious(10-25)"]}(${list2[1]["serious(10-25)"]}%)`]);
						table.push(['不合格 (0-10)', `${list[0]["failed(0-10)"]}(${list[1]["failed(0-10)"]}%)`, `${list2[0]["failed(0-10)"]}(${list2[1]["failed(0-10)"]}%)`]);

						// 將數據轉換為 Excel 兼容格式
						const worksheet = XLSX.utils.aoa_to_sheet(table);
						// 將工作表添加到工作簿中，名稱為 tenderMap[tenderId] 的值
						XLSX.utils.book_append_sheet(workbook, worksheet, tenderMap[tenderId]);
					}
				});
			});

			// 等待所有的數據都加載完成
			Promise.all(allTenderMap).then(() => {
				// 生成 Excel 文件的二進制字符串
				const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

				// 創建 Blob 並觸發文件下載
				const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = 'PCI數據統計(8-30).xlsx';
				link.click();

				this.$message({
					message: '資料匯出成功',
					type: 'success'
				});
			}).catch(err => {
				console.log(err);
				this.$message({
					message: '匯出失敗',
					type: 'error'
				});
			});
		},
		exportAllDistressType() {
			const surveyIdMap = {
				77: '萬華區(8-30)',
				78: '中正區(8-30)',
				79: '士林區(8-30)',
				80: '北投區(8-30)',
				81: '大安區(8-30)',
				82: '信義區(8-30)',
				83: '南港區(8-30)',
				84: '文山區(8-30)',
				85: '松山區(8-30)',
				86: '內湖區(8-30)',
				92: '橋涵區1(8-30)',
				93: '橋涵區2(8-30)'
			};

			const surveyIdArr = Object.keys(surveyIdMap).map(Number);  // 取得所有 surveyId 的陣列

			// 創建 Excel 工作簿
			const workbook = XLSX.utils.book_new();
			// 記錄是否有資料
			let hasData = false;

			// 使用 Promise.all 來並行處理所有 API 請求
			Promise.all(
				surveyIdArr.map(surveyId => 
					getDistressStatistics({ surveyId }).then(response => {
						if (response.data.list.length != 0) {
							// 有資料則標記
							hasData = true;
							// 將數據轉換為 Excel 兼容格式
							const worksheet = XLSX.utils.json_to_sheet(response.data.list);
							// 取得對應的行政區名稱，並將工作表添加到工作簿中
							const sheetName = surveyIdMap[surveyId];  // 使用 surveyIdMap 的值作為工作表名稱
							XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
						}
					})
				)
			).then(() => {
				// 如果有資料，則生成並下載 Excel 文件
				if (hasData) {
					// 生成 Excel 文件的二進制字符串
					const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

					// 創建 Blob 並觸發文件下載
					const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `調查缺失類型統計(8-30).xlsx`;
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
		exportAllRoadAverage() {
			const tenderMap = {
				1002: '中正區(8-30)',
				1052: '松山區(8-30)',
				1062: '大安區(8-30)',
				1082: '萬華區(8-30)',
				1102: '信義區(8-30)',
				1112: '士林區(8-30)',
				1122: '北投區(8-30)',
				1142: '內湖區(8-30)',
				1152: '南港區(8-30)',
				1162: '文山區(8-30)',
				99921: '橋涵區1(8-30)',
				99922: '橋涵區2(8-30)'
			};

			// Create a new Excel workbook
			const workbook = XLSX.utils.book_new();

			// Use Promise.all to fetch data for all tender IDs concurrently
			const allTenderPromises = Object.keys(tenderMap).map(tenderId => {
				return getRoadAverage({ tenderId }).then(response => {
					const list = response.data.list;

					if (list.length !== 0) {
						const table = [];
						table.push(['道路名稱', '平均PCI']);
						list.forEach(item => {
							table.push([item["道路名稱"], item["average"]]);
						});
						// Convert data to Excel-compatible format
						const worksheet = XLSX.utils.aoa_to_sheet(table);
						// Add the worksheet to the workbook, named according to tenderMap
						XLSX.utils.book_append_sheet(workbook, worksheet, tenderMap[tenderId]);
					}
				});
			});

			// Wait for all data to be fetched and processed
			Promise.all(allTenderPromises).then(() => {
				// Generate binary string for the Excel file
				const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

				// Create Blob and trigger file download
				const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = '道路平均PCI統計(8-30).xlsx';
				link.click();

				this.$message({
					message: '資料匯出成功',
					type: 'success'
				});
			}).catch(err => {
				console.log(err);
				this.$message({
					message: '匯出失敗',
					type: 'error'
				});
			});
		},
		fixCorrectGeoJson() {
			// console.log(this.listQuery.tenderId);
			updateCorrectGeoJson({ tenderId: this.listQuery.tenderId }).then(response => {
				this.$message({
					message: '資料已修正',
					type: 'success'
				});
			}).catch(err => console.log(err));
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