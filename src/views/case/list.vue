<template>
	<div class="app-container road-case" v-loading="loading">
		<h2>缺失列表</h2>
		<div class="filter-container">
			<div class="filter-item">
				<div v-if="listQuery.filterType == 1" class="select-contract">
					<el-select v-model="listQuery.filterType" popper-class="type-select">
						<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
					<el-select v-model="listQuery.contractType" popper-class="type-select" style="width: 115px">
						<el-option v-for="(name, type) in options.contractType" :key="type" :label="name" :value="Number(type)" />
					</el-select>
				</div>
				
				<el-tooltip v-else effect="dark" content="不填為查詢全部" placement="bottom-end">
					<el-input
						v-model="listQuery.filterStr"
						placeholder="請輸入"
						style="width: 200px"
					>
						<el-select slot="prepend" v-model="listQuery.filterType" popper-class="type-select">
							<el-option v-for="(name, type) in options.filterType" :key="type" :label="name" :value="Number(type)" />
						</el-select>
					</el-input>
				</el-tooltip>
			</div>
			<!-- <time-picker class="filter-item" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> -->
			<el-button
				class="filter-item"
				:type="checked.length == 0 ? 'success' : 'danger'"
				:plain="checked.length != 0"
				icon="el-icon-s-order"
				@click="filterDialogOpen"
				>過濾</el-button>
			<el-button
				v-if="checked.length != 0"
				type="text"
				size="mini"
				@click="filterClear"
				>清空過濾條件</el-button>
			<el-checkbox v-model="listQuery.filter" style="margin-left: 20px">已刪除</el-checkbox>
		</div>

		<!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

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
			>
				<template slot-scope="{ row, column }">
					<span>{{ formatter(row, column) }}</span>
					<span v-if="column.property == 'caseName'">
						<el-popover popper-class="imgHover" placement="top" trigger="hover" :close-delay="0">
							<el-image style="width: 100%; height: 100%" :src="`https://img.bellsgis.com/images/online_pic/${row.caseId}.jpg`" fit="scale-down" />
							<el-button slot="reference" class="btn-action" type="primary" plain size="mini" round @click="showImg(row)">檢視</el-button>
							<!-- <i  class="el-icon-picture" style="color: #409EFF; margin-left: 5px" /> -->
						</el-popover>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="狀態" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.reccontrol == '1'">
						<i class="el-icon-check" style="color: #67C23A" />
						<el-button class="btn-action" type="danger" plain size="mini" round @click="setCaseStatus(row, 8)">刪除</el-button>
					</span>
					<span v-else-if="row.reccontrol == '8'">
						<i class="el-icon-close" style="color: #F56C6C" />
						<el-button class="btn-action" type="success" plain size="mini" round @click="setCaseStatus(row, 1)">復原</el-button>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center">
				<template slot-scope="{ row }">
					<el-button-group>
						<el-button class="btn-action" type="primary" plain size="mini" round @click="showMap(row)">地圖</el-button>
						<el-button class="btn-action" type="info" icon="el-icon-search" plain size="mini"  round @click="showMapViewer(row)" />
					</el-button-group>
				</template>
			</el-table-column>
		</el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />

		<el-image-viewer
			v-if="showImgViewer"
			class="img-preview"
			:on-close="() => { showImgViewer = false; }"
			:url-list="imgUrls"
		/>

		<el-dialog
			class="dialog-filter"
			:visible.sync="dialogFilterVisible"
			title="過濾條件"
			:show-close="false"
			center
		>
			<el-row>
				<el-col
					v-for="title in Object.keys(options.caseTitle)"
					:key="title"
					:span="12"
					:class="{ 'check-all-col': options.caseTitle[title]['checkAll'] }"
				>
					<el-checkbox
						v-model="options.caseTitle[title]['checkAll']"
						class="check-all-btn"
						border
						:indeterminate="options.caseTitle[title]['isIndeterminate']"
						@change="handleCheckAllChange(title)"
						>{{ options.caseTitle[title]["name"] }}</el-checkbox>
					<el-checkbox-group v-model="checked" @change="handleCheckedChange">
						<span v-for="type in caseClass[title]" :key="type" style="display: flex; align-items: center;">
							<el-checkbox :label="type" style="width: 70%">
								<span>{{ type }}</span>
							</el-checkbox>
							<el-select v-model="typeLevel[type]" placeholder="請選擇" size="mini" popper-class="type-select" :disabled="!checked.includes(type)"  @change="(val) => handleLevelSelect(val, type)">
								<el-option v-for="order in [0, 3, 2, 1]" :key="order" :value="order" :label="options.levelMap[order]" />
							</el-select>
						</span>
					</el-checkbox-group>
				</el-col>
			</el-row>

			<span slot="footer" class="dialog-footer">
				<el-button @click="filterCancel">取消</el-button>
				<el-button type="primary" @click="filterConfirm">確定</el-button>
			</span>
			<!-- <h4>{{ listQuery.caseType }}</h4> -->
		</el-dialog>

		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="600px" style="height: 800px">
			<map-viewer :map.sync="map"/>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getRoadCaseType, getRoadCaseList, setRoadCase } from "@/api/road";
// import TimePicker from "@/components/TimePicker";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

export default {
	name: "roadCase",
	components: { Pagination, ElImageViewer, MapViewer },
	data() {
		return {
			loading: false,
			showImgViewer: false,
			dialogMapVisible: true,
			dialogFilterVisible: false,
			map: {},
			imgUrls: "",
			caseTypeTemp: [],
			caseTitleTemp: [],
			// timeTabId: moment().year(),
			// dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			// daterange: [
			// 	moment().month(5).startOf("month").toDate(),
			// 	moment().endOf("year").toDate(),
			// ],
			// searchRange: "",
			listQuery: {
				filter: false,
				filterType: 1,
				contractType: 9101,
				filterStr: null,
				caseType: [],
				pageCurrent: 1,
				pageSize: 50,
			},
			headers: {
				id: {
					name: "序號",
					sortable: true,
				},
				caseId: {
					name: "缺失編號",
					sortable: true,
				},
				caseName: {
					name: "缺失類型",
					sortable: true,
				},
				caseLevel: {
					name: "損壞程度",
					sortable: true,
				},
				roadName: {
					name: "道路名稱",
					sortable: true,
				},
				// width: {
				// 	name: "寬度(cm)",
				// 	sortable: true,
				// },
				length: {
					name: "長度(m)",
					sortable: true,
				},
				area: {
					name: "面積(㎡)",
					sortable: true,
				},
				depth: {
					name: "深度(cm)",
					sortable: true,
				},
				// reccontrol: {
				// 	name: "狀態",
				// 	sortable: false
				// }
			},
			total: 0,
			list: [],
			roadIdMap: {
				0: "路口",
				1: "順向",
				2: "逆向",
			},
			districtList: {
				100: {
					name: "中正區",
					engName: "Zhongzheng",
				},
				103: {
					name: "大同區",
					engName: "Datong",
				},
				104: {
					name: "中山區",
					engName: "Zhongshan",
				},
				105: {
					name: "松山區",
					engName: "Songshan",
				},
				106: {
					name: "大安區",
					engName: "Da’an",
				},
				108: {
					name: "萬華區",
					engName: "Wanhua",
				},
				110: {
					name: "信義區",
					engName: "Xinyi",
				},
				111: {
					name: "士林區",
					engName: "Shilin",
				},
				112: {
					name: "北投區",
					engName: "Beitou",
				},
				114: {
					name: "內湖區",
					engName: "Neihu",
				},
				115: {
					name: "南港區",
					engName: "Nangang",
				},
				116: {
					name: "文山區",
					engName: "Wenshan",
				},
			},
			options: {
				filterType: {
					1: "合約",
					2: "缺失編號",
					3: "道路名稱"
				},
				contractType: {
					9101: "中山區成效R1"
				},
				caseTitle: {
					0: {
						name: "龜裂",
						filter: ["龜裂"],
						checkAll: false,
						isIndeterminate: false
					},
					1: {
						name: "裂縫",
						filter: ["裂縫", "縱橫裂縫", "塊狀裂縫"],
						checkAll: false,
						isIndeterminate: false
					},
					2: {
						name: "坑洞及人孔高差與薄層剝離", 
						filter: ["坑洞", "人孔高差", "薄層剝離"],
						checkAll: false,
						isIndeterminate: false
					},
					3: {
						name: "車轍",
						filter: ["車轍"],
						checkAll: false,
						isIndeterminate: false
					},
					4: {
						name: "補綻及管線回填", 
						filter: ["補綻", "管線回填"],
						checkAll: false,
						isIndeterminate: false
					},
					5: {
						name: "隆起與凹陷",
						filter: ["隆起與凹陷"],
						checkAll: false,
						isIndeterminate: false
					},
					6: {	
						name: "其他",
						checkAll: false,
						isIndeterminate: false
					}
				},
				caseType: [],
				levelMap: {
					0: "全部",
					1: "輕",
					2: "中",
					3: "重"
				},
			}
		};
	},
	computed: {
		checked: {
			get() {
				return this.listQuery.caseType.filter(type => (type.checked)).map(type => (type.name));
			},
			set(val) {
				this.listQuery.caseType.forEach(type => {
					if(val.includes(type.name)) type.checked = true;
					else type.checked = false;
				})
			}
		},
		typeLevel() {
			let typeLevel = {};
			this.listQuery.caseType.forEach(type => this.$set(typeLevel, type.name, type.level) );
			return typeLevel;
		},
		caseClass() {
			let checked = Array.from({ length: this.options.caseType.length }, () => (false));
			let caseClass = {};
			for(const titleId in this.options.caseTitle) {
				caseClass[titleId] = [];
				for(const [ index, caseSpec ] of this.options.caseType.entries()) {
					if(this.options.caseTitle[titleId].filter == undefined) {
						if(checked[index] == false) caseClass[titleId].push(caseSpec);
					}else {
						if(checked[index] == false) {
							let caseFlag = false;
							for(const filter of this.options.caseTitle[titleId].filter) {
								caseFlag = (caseSpec.indexOf(filter) != -1);
								if(caseFlag) {
									checked[index] = true;
									caseClass[titleId].push(caseSpec);
									break;
								}
							}
						} 
					}
				}
			}

			return caseClass
		}
	},
	watch: {},
	created() {
		getRoadCaseType().then(response => {
			// this.listQuery.caseType = JSON.parse(JSON.stringify(response.data.list));
			this.options.caseType = JSON.parse(JSON.stringify(response.data.list));
			for(const type of this.options.caseType) this.listQuery.caseType.push({ name: type, checked: false, level: 0 });
			this.getList();
		});
		// this.listQuery.distList = Object.keys(this.districtList);
		
	},
	mounted(){
		this.dialogMapVisible = false;
	},
	methods: {
		handleLevelSelect(val, typeName) {
			this.listQuery.caseType.filter(type => (type.name == typeName))[0].level = val;
		},
		showImg(row) {
			this.imgUrls = [ `https://img.bellsgis.com/images/online_pic/${row.caseId}.jpg` ];
			this.showImgViewer = true;
		},
		showMap(row) {
			this.$router.push({
				path: "/case/caseMap",
				query: { caseId: row.caseId },
			});
		},
		showMapViewer(row) {
			// console.log("showMap");
			this.map.data.forEach(feature => this.map.data.remove(feature));
			this.dialogMapVisible = true;

			let geoJSON_case = { 
				"type": "FeatureCollection",
				"name": "polyJSON",
				"features": []
			};
			// console.log(row.wkb_geometry);

			geoJSON_case.features.push({
				"type": "Feature",
				"properties": { },
				"geometry": row.wkb_geometry
			});

			// console.log(geoJSON_case);

			this.map.data.addGeoJson(geoJSON_case);
			this.map.data.setStyle({ 
				strokeColor: '#F56C6C',
				strokeWeight: 3,
				strokeOpacity: 0.9,
				fillColor: '#F56C6C',
				fillOpacity: 0.8
			});

			const depth = row.isLine ? 1 : 2;
			const paths = row.wkb_geometry.coordinates.flat(depth).map(point => ({ lat: point[1], lng: point[0] }));
			const bounds = new google.maps.LatLngBounds();
			paths.forEach(position => bounds.extend(position));
			this.map.fitBounds(bounds);
			const zoom = this.map.getZoom();
			this.map.setZoom(zoom < 21 ? 21 : zoom);
			// this.map.setCenter(bounds.getCenter());
			// this.map.panToBounds(bounds);
		},
		getList() {
			this.loading = true;

			// let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
			// this.searchRange = startDate + " - " + endDate;

			this.list = [];

			let query = {
				filter: this.listQuery.filter,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize,
			};

			if(this.listQuery.filterType == 2 && this.listQuery.filterStr.length != 0) query.caseId = this.listQuery.filterStr;
			if(this.listQuery.filterType == 3 && this.listQuery.filterStr.length != 0) query.roadName = this.listQuery.filterStr;
			if(this.listQuery.caseType.length != 0) query.caseType = JSON.stringify(this.listQuery.caseType);

			getRoadCaseList(query).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
					this.total = 0;
				} else {
					this.total = response.data.total;
					this.list = response.data.list;
					this.list.forEach(l => {
						if(l.wkb_geometry) l.wkb_geometry = JSON.parse(l.wkb_geometry);
					});
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		filterDialogOpen() {
			this.dialogFilterVisible = true;
			this.caseTypeTemp = JSON.parse(JSON.stringify(this.listQuery.caseType));
			this.caseTitleTemp = JSON.parse(JSON.stringify(this.options.caseTitle));
		},
		filterConfirm() {
			this.listQuery.pageCurrent = 1;
			this.dialogFilterVisible = false;
			this.getList();
		},
		filterCancel() {
			this.dialogFilterVisible = false;
			this.listQuery.caseType = JSON.parse(JSON.stringify(this.caseTypeTemp));
			this.options.caseTitle = JSON.parse(JSON.stringify(this.caseTitleTemp));
		},
		filterClear() {
			this.checked = [];
			this.listQuery.pageCurrent = 1;
			Object.keys(this.options.caseTitle).forEach((k) => {
				this.options.caseTitle[k].checkAll = false;
				this.options.caseTitle[k].isIndeterminate = false;
			});
			this.getList();
		},
		setCaseStatus(row, type) {
			// console.log(this.currCaseId);
			setRoadCase(row.caseId, { type }).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "修改成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		indexMethod(index) {
			return (index + 1 + (this.listQuery.pageCurrent - 1) * this.listQuery.pageSize);
		},
		formatter(row, column) {
			if (column.property.indexOf("id") == -1 && column.property.indexOf("Id") == -1 && Number(row[column.property])) return row[column.property].toLocaleString();
			else return row[column.property] || "-";
		},
		formatTime(time) {
			return moment(time).utc().format("YYYY-MM-DD");
		},
		handleCheckAllChange(title) {
			let values = this.caseClass[title];
			if (this.options.caseTitle[title]["checkAll"]) {
				this.checked.push(...values);
			} else {
				this.checked = this.checked.filter((el) => values.indexOf(el) == -1);
			}
			this.checked = [...new Set(this.checked)];
			this.options.caseTitle[title]["isIndeterminate"] = false;
		},
		handleCheckedChange() {
			let titles = Object.keys(this.options.caseTitle);
			titles.forEach((title) => {
				let values = this.caseClass[title];
				let temp = values.filter((el) => this.checked.indexOf(el) != -1);
				this.options.caseTitle[title]["isIndeterminate"] = false;
				this.options.caseTitle[title]["checkAll"] = false;
				if (temp.length == 0) {
					this.options.caseTitle[title]["checkAll"] = false;
				} else if (temp.length == values.length) {
					this.options.caseTitle[title]["checkAll"] = true;
				} else {
					this.options.caseTitle[title]["isIndeterminate"] = true;
				}
			});
		},
		async handleDownload() {
			// await this.dateWatcher();

			// const startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
			// const endDate = moment(this.daterange[1]).format("YYYY-MM-DD");

			getRoadUnit({
				pageCurrent: 1,
				pageSize: this.total,
				// timeStart: startDate,
				// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
			}).then((response) => {
				let list = response.data.list;

				const tHeader = Object.values(this.headers).map((h) => h.name);
				const filterVal = Object.keys(this.headers);
				// tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
				// filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
				const data = this.formatJson(filterVal, list);

				import("@/vendor/Export2Excel").then((excel) => {
					excel.export_json_to_excel({
						header: tHeader,
						data,
					});
				});
			});
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map((v) => filterVal.map((j) => v[j]));
		},
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
.imgHover
	max-width: 800px
	height: 400px
.road-case
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 85px
				.el-input__inner
					padding-left: 3px
					padding-right: 10px
					text-align: center
				.el-input__suffix
					right: 0
					margin-right: -3px
					transform: scale(0.7)
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
	.btn-action
		margin-left: 5px
		padding: 5px 8px
	.img-preview
		width: 100%
		.el-image-viewer__mask
			opacity: 0.7
		.el-icon-circle-close
			color:  #FFF
	.dialog-filter .el-dialog
		width: 450px
		overflow: hidden
		.el-dialog__header
			background-color: #EBEEF5
		.el-dialog__body
			height: 80%
			padding: 10px
			margin: 0px 10px
			.el-row
				display: flex
				flex-wrap: wrap
				.el-col
					padding: 10px 0px
					position: relative
					&::before
						display: block
						content: ''
						position: absolute
						border: 1px solid #eee
						height: 100%
						width: 100%
					&.check-all-col::before
						box-shadow: 0px 0px 2px #409EFF
					.el-checkbox
						width: 100%
						padding-left: 20px
					.check-all-btn
						padding-left: 10px
						margin-bottom: 5px
						background-color: #F2F6FC
						border: none
						border-radius: 0px
						box-shadow: inset 0px 0px 1px #C0C4CC
						&.is-checked
							background-color: #409EFF
							span
								color: white
					.el-checkbox__input.is-indeterminate .el-checkbox__inner
						background-color: lighten(#409EFF, 15)
					.el-select
						width: 55px
						.el-input__inner
							padding: 0 13px 0 5px
							text-align: center
							background-color: transparent
						.el-input__suffix
							right: 0px
							margin-right: -3px
							transform: scale(0.7)
			.el-dialog__footer
				margin: 5px 0px
	.dialog-map
		min-height: 600px
		height: 30%
</style>