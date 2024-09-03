<template>
	<div class="app-container PCI-Manager" v-loading="loading">
		<h2>破壞調查表數值</h2>
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
				:formatter="formatter"
				:sortable="value.sortable"
				:width="value.width"
			>
			</el-table-column>
			<el-table-column label="PCI計算" align="center" >
				<el-table-column label="區塊" align="center" width="400">
					<template slot-scope="{ row }">
						<el-row v-if="!row.archiveTime" :gutter="5" type="flex" justify="center" align="middle" width="200">
							<el-col :span="14">
								<el-input v-model="row.blockId" placeholder="區塊編碼" />
							</el-col>
							<el-col :span="10">
								<el-button-group>
									<el-button class="btn-action" type="primary" plain @click="calPCISpec(row.id, row.blockId, 0)">重算</el-button>
									<el-button class="btn-action" type="success" plain @click="exportExcel()">匯出</el-button>
									<!-- <el-button class="btn-action" type="info" plain @click="calPCISpec(row.id, row.blockId, -1)">重置</el-button>
									<el-button class="btn-action" type="success" plain @click="calPCISpec(row.id, row.blockId, 100)">滿值</el-button> -->
								</el-button-group>
							</el-col>
						</el-row>
						<span v-else> - </span>
					</template>
				</el-table-column>
			</el-table-column>
		</el-table>

	</div>
</template>

<script>
import moment from "moment";
import { getTenderMap, getTenderRound, archiveTenderRound } from "@/api/type";
import { resetPCI, updatePCI, updatePCIByName } from "@/api/tool";
import { getBlockCase } from "@/api/road";
import checkPermission from '@/utils/permission';
import XLSX from 'xlsx';

export default {
	name: "PCIManager",
	data() {
		return {
			loading: false,
			isUpload: false,
			showAddDialog: false,
			screenWidth: window.innerWidth,
			listQuery: {
				tenderId: 100,
				blockId: null
			},
			headers: {
				id: {
					name: "SurveyId",
					sortable: false,
					width: 200
				},
				tenderId: {
					name: "TenderId",
					sortable: false,
					width: 200
				},
				round: {
					name: "輪次",
					sortable: false,
					width: 200
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
			distressList:[],
			densityAndDvList: [],
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
	computed: {},
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
		calPCI(surveyId, pciValue) {
			resetPCI({ tenderId: this.listQuery.tenderId, surveyId, pciValue }).then(response => {
				if (response.statusCode == 20000 ) {
					const action = pciValue == 0 ? '重算' : pciValue == -1 ? '重置' : '滿值';
					this.$message({
						message: `${action}成功`,
						type: "success",
					});
				} 
			}).catch(err => console.log(err));
		},
		calPCISpec(surveyId, blockId, pciValue) {
			if(!Number(blockId)) {
				this.$message({
					message: "請輸入正確區塊Id",
					type: "error",
				});
				blockId = "";
			} else {
				updatePCI({ tenderId: this.listQuery.tenderId, surveyId, pciValue, blockId }).then(response => {
					if (response.statusCode == 20000 ) {
						console.log(response.data);
						this.densityAndDvList = response.data;
						// this.densityAndDvList.push(response.data.densityAndDv);
						const action = pciValue == 0 ? '重算' : pciValue == -1 ? '重置' : '滿值';
						this.$message({
							message: `${action}成功`,
							type: "success",
						});
					} 
				}).catch(err => console.log(err));
				
				getBlockCase({ tenderId: this.listQuery.tenderId, surveyId, blockId }).then(response => {
					// console.log(response.data);
					this.distressList = response.data;
				}).catch(err => console.log(err));

			}
		},
		exportExcel() {
			const dv = this.densityAndDvList.data; // 密度 dv
			const list = this.distressList.list; // 損壞類型 程度
			const reductionVal = this.densityAndDvList.reductionVal[0]; // 折減值dv 加總tdv 修正折減值cdvDetails
			console.log(reductionVal);
			
			// 缺失類別
			const distressTypeMap = {
				'龜裂': 1,
				'縱橫裂縫': 2,
				'塊狀裂縫': 3,
				'坑洞': 4,
				'人孔高差': 4,
				'薄層剝離': 4,
				'車轍': 5,
				'補綻及管線回填': 6,
				'推擠': 7,
				'隆起與凹陷': 8,
				'冒油': 9,
				'波浪狀鋪面': 10,
				'車道與路肩分離': 11,
				'滑溜裂縫': 12,
				'骨材剝落': 13,
				'凹陷': 21,
				'邊緣裂縫': 22,
				'反射裂縫': 23,
				'跨越鐵道': 24,
				'隆起': 25,
				'剝脫': 26,
				'老化': 27
			};

			// 損壞程度
			const severityLevelMap = {
				'輕': 'L',
				'中': 'M',
				'重': 'H'
			};

			const distressData = {};
			
			for (let i = 0; i < list.length; i++) {
				const { distressType, distressLevel, caseArea, caseLength } = list[i];

				const typeCode = distressTypeMap[distressType]; // 缺失類別
				const levelCode = severityLevelMap[distressLevel]; // 損壞程度

				// Initialize the structure if it doesn't exist
				if (!distressData[typeCode]) {
					distressData[typeCode] = {};
				}

				if (!distressData[typeCode][levelCode]) {
					distressData[typeCode][levelCode] = { areas: [], lengths: [] };
				}

				if (caseArea != null) {
					distressData[typeCode][levelCode].areas.push(caseArea);
				}

				if (caseLength != null) {
					distressData[typeCode][levelCode].lengths.push(caseLength);
				}
			}

			const table = [];

			let maxLength = 0; // 缺失類型和嚴重程度
			// 取出最大長度 (目的對其各項資料)
			for (const [typeCode, level] of Object.entries(distressData)) {
				for (const [levelCode, data] of Object.entries(level)) {
					const currentMaxLength = Math.max(data.areas.length, data.lengths.length);
					if (currentMaxLength > maxLength) {
						maxLength = currentMaxLength;
					}
				}
			}

			table.push(['破壞類型及\n嚴重程度', '數量', ...Array(maxLength - 1).fill(''), '總數', '密度(%)', '折減值']);

			for (const [typeCode, level] of Object.entries(distressData)) {
				for (const [levelCode, data] of Object.entries(level)) {
					const areasTotal = data.areas.reduce((acc, cur) => acc + parseFloat(cur) || 0, 0); // 面積總數
					const lengthsTotal = data.lengths.reduce((acc, cur) => acc + parseFloat(cur) || 0, 0); // 長度總數

					dv.map(item => {
						if (item.PCI_class == `${typeCode}${levelCode}`) {
							if (data.areas.length > 0) {
								table.push([`${typeCode}${levelCode}`, ...data.areas, ...Array(maxLength - data.areas.length).fill(''), areasTotal.toFixed(2), item.density.toFixed(2), item.dv.toFixed(2)]);
							}
							if (data.lengths.length > 0) {
								table.push([`${typeCode}${levelCode}`, ...data.lengths, ...Array(maxLength - data.lengths.length).fill(''), lengthsTotal.toFixed(2), item.density.toFixed(2), item.dv.toFixed(2)]);
							}
						}
					});
				}
			}

			table.push([], []); // 空兩行
			table.push(['折減值', ...Array(reductionVal.dvListArr[0].length - 1).fill(''), '加總', '修正折減值']);
			for (let i = 0; i < reductionVal.dvListArr[0].length; i++) {
				table.push([...reductionVal.dvListArr[i].map(num => num.toFixed(2)), reductionVal.tdvArr[i].toFixed(2), reductionVal.cdvDetails[i].toFixed(2)]);
			}
			
			console.log(table);
			
			
			// 將數據轉換為 Excel 兼容格式
			const worksheet = XLSX.utils.aoa_to_sheet(table);
			// 創建 Excel 工作簿
			const workbook = XLSX.utils.book_new();
			// 將工作表添加到工作簿中
			XLSX.utils.book_append_sheet(workbook, worksheet, '破壞調查表數值');
			// 生成 Excel 文件的二進制字符串
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

			// 創建 Blob 並觸發文件下載
			const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `破壞調查表.xlsx`;
			link.click();
			
		},
		// calPCIRoad(surveyId, roadName, pciValue) {
		// 	if(roadName.length == 0) {
		// 		this.$message({
		// 			message: "請輸入路名",
		// 			type: "error",
		// 		});
		// 	} else {
		// 		updatePCIByName({ tenderId: this.listQuery.tenderId, surveyId, pciValue, roadName }).then(response => {
		// 			if (response.statusCode == 20000 ) {
		// 				const action = pciValue == 0 ? '重算' : pciValue == -1 ? '重置' : '填滿';
		// 				this.$message({
		// 					message: `${action}成功`,
		// 					type: "success",
		// 				});
		// 			} 
		// 		}).catch(err => console.log(err))
		// 	}
		// },
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
.PCI-Manager
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