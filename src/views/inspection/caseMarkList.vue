<template>
	<div class="app-container case-marker-list" v-loading="loading">
		<h2>標記列表</h2>
		<aside style="white-space: pre-line">
			1. 缺失類型: 人手孔缺失 和 其他 不能匯入。
			<br>
			2. 已匯入過的缺失不會重複匯入。
		</aside>
		<div class="filter-container">
			<span class="filter-item">
				<el-input v-model="listQuery.caseInspectId" placeholder="請輸入">
					<span slot="prepend">缺失Id</span>
				</el-input>
			</span>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="listQuery.pageCurrent = 1; getList();">搜尋</el-button>
			<br>
			<div class="filter-item">
				<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model.number="listQuery.tenderId" class="tender-select" popper-class="type-select tender" :disabled="tableSelect.length == 0 || isUpload">
						<el-option v-for="(val, type) in options.tenderMap" :key="type" :label="val.tenderName" :value="Number(type)" />
					</el-select>
				</div>
			</div>
			<el-button type="success" :disabled="tableSelect.length == 0 || isUpload" @click="uploadCase()">上傳</el-button>
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
			@selection-change="handleCheckedChange"
		>
			<el-table-column type="selection" width="60" align="center" fixed :selectable="(row)=> (![34, 21].includes(row.DistressType))" />
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
					<span v-if="column.property.includes('Img')">
						<el-popover popper-class="imgHover" placement="top" trigger="hover" :close-delay="0">
							<el-image style="width: 100%; height: 100%" :src="row[column.property]" fit="scale-down" />
							<el-image slot="reference" style="width: 100%; height: 100%" :src="row[column.property]" fit="scale-down" @click="showImg(row, column.property)"/>
						</el-popover>
					</span>
					<span v-else>{{ formatter(row, column) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="地圖" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="info" icon="el-icon-search" plain size="mini" round @click="showMapViewer(row)" />
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

		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="600px">
			<map-viewer :map.sync="map"/>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderMap } from "@/api/type";
import { getInspectionCaseList, importInspectionCase } from "@/api/inspection";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

export default {
	name: "caseMarkerList",
	components: { Pagination, ElImageViewer, MapViewer },
	data() {
		return {
			loading: false,
			isUpload: false,
			showImgViewer: false,
			dialogMapVisible: true,
			map: {},
			imgUrls: "",
			// timeTabId: moment().year(),
			// dateTimePickerVisible: false,
			screenWidth: window.innerWidth,
			// dateRange: [
			// 	moment().year(2022).month(5).startOf("month").toDate(),
			// 	moment().endOf("year").toDate(),
			// ],
			listQuery: {
				caseInspectId: "",
				tenderId: 91,
				pageCurrent: 1,
				pageSize: 50,
			},
			headers: {
				id: {
					name: "id",
					sortable: true,
				},
				TrackingId: {
					name: "追蹤Id",
					sortable: false,
				},
				DistressTypeName: {
					name: "缺失類型",
					sortable: true,
				},
				DistressLevel: {
					name: "損壞程度",
					sortable: true,
				},
				// roadName: {
				// 	name: "道路名稱",
				// 	sortable: true,
				// },
				MillingLength: {
					name: "長度(m)",
					sortable: true,
				},
				MillingWidth: {
					name: "寬度(cm)",
					sortable: true,
				},
				MillingArea: {
					name: "面積(㎡)",
					sortable: true,
				},
				ImgZoomIn: {
					name: "近照",
					sortable: false,
				},
				ImgZoomOut: {
					name: "遠照",
					sortable: false,
				}
			},
			// total: 0,
			list: [],
			tableSelect: [],
			options: {
				tenderMap: {},
				caseTypeMap: {
					15: "坑洞",
					29: "縱向及橫向裂縫",
					16: "龜裂",
					32: "車轍",
					18: "隆起與凹陷",
					34: "人手孔缺失",
					51: "薄層剝離",
					21: "其他",
					50: "塊狀裂縫",
					53: "推擠",
					65: "補綻及管線回填",
					54: "冒油",
					55: "波浪狀鋪面",
					56: "車道與路肩分離",
					49: "滑溜裂縫",
					66: "骨材剝落",
					58: "人孔高差"
				},
				pciCaseTypeMap: {
					15: "坑洞",
					29: "縱橫裂縫",
					16: "龜裂",
					32: "車轍",
					18: "隆起與凹陷",
					// 34: "人手孔缺失",
					51: "薄層剝離",
					51: "薄層剝離",
					// 21: "其他",
					50: "塊狀裂縫",
					53: "推擠",
					65: "補綻及管線回填",
					54: "冒油",
					55: "波浪狀鋪面",
					56: "車道與路肩分離",
					49: "滑溜裂縫",
					66: "骨材剝落",
					58: "人孔高差"
				},
				caseLevelMap: {
					1: "輕",
					2: "中",
					3: "重"
				},
				roadDir: {
					0: "無",
					1: "順向",
					2: "逆向"
				}
			}
		};
	},
	computed: { },
	watch: {},
	created() {
		getTenderMap().then(response => {
			this.options.tenderMap = response.data.tenderMap;
			if(Object.keys(this.options.tenderMap).length > 0) {
				if(!Object.keys(this.options.tenderMap).includes(String(this.listQuery.tenderId))) this.listQuery.tenderId = Object.keys(this.options.tenderMap)[0];
			}
		});
	},
	mounted() {
		this.dialogMapVisible = false;

		if (this.$route.query.caseInspectId) {
			this.listQuery.caseInspectId = this.$route.query.caseInspectId;
			this.getList();
		}
	},
	methods: {
		handleCheckedChange(val) {
			this.tableSelect = val;
		},
		showImg(row, prop) {
			const otherProp = ['ImgZoomIn', 'ImgZoomOut'].filter(imgType => imgType != prop)[0];
			this.imgUrls = [ row[prop], row[otherProp] ];
			this.showImgViewer = true;
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
				"geometry": row.Geometry
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

			const depth = row.Geometry.type == "MultiLineString" ? 1 : 2;
			const paths = row.Geometry.coordinates.flat(depth).map(point => ({ lat: point[1], lng: point[0] }));
			const bounds = new google.maps.LatLngBounds();
			paths.forEach(position => bounds.extend(position));
			this.map.fitBounds(bounds);

			const zoom = this.map.getZoom();
			this.map.setZoom(zoom < 21 ? 21 : zoom);
		},
		getList() {
			this.loading = true;
			this.list = [];
			this.tableSelect = [];
			this.$router.push({ query: { caseInspectId: this.listQuery.caseInspectId }});

			getInspectionCaseList({
				caseInspectId: this.listQuery.caseInspectId
			}).then(response => {
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
						l.DistressTypeName = this.options.caseTypeMap[l.DistressType];
						l.DistressLevel = this.options.caseLevelMap[l.DistressLevel];
					})
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		uploadCase() {
			this.$confirm(`確定上傳缺失 ${this.tableSelect.length} 件 至 「${this.options.tenderMap[this.listQuery.tenderId].tenderName}」?`, "確認", {
				showClose: false,
			}).then(() => {
				this.loading = true;
				this.isUpload = true;

				const uploadCaseList = this.tableSelect.map(caseSpec => {
					return { caseDetectionId: caseSpec.id, caseName: this.options.pciCaseTypeMap[caseSpec.DistressType], caseLevel: caseSpec.DistressLevel, geoJson: caseSpec.Geometry }
				});
				// console.log(uploadCaseList);

				importInspectionCase({
					tenderId: this.listQuery.tenderId,
					caseList: uploadCaseList
				}).then(response => {
					if ( response.statusCode == 20000 ) {
						const result = response.result;
						this.$message({
							message: `上傳缺失結果(共 ${result.total}件): 成功 ${result.success}件 / 重複 ${result.fail}件`,
							type: "success",
						});
					} 
					this.isUpload = false;
					this.loading = false;
				}).catch(err => {
					console.log(err);
					this.loading = false;
					this.isUpload = false;
				})

			}).catch(err => {
				console.log(err);
			});

		},
		formatter(row, column) {
			if (!["id", "Id"].includes(column.property) && Number(row[column.property])) return (Math.round(row[column.property] * 100)/100).toLocaleString();
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
.imgHover
	max-width: 400px
	// height: 400px
.case-marker-list
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select.tender-select
				width: 320px
				.el-input__inner
					padding-left: 10px
					text-align: left
	.btn-action
		margin-left: 5px
		padding: 5px
	.img-preview
		width: 100%
		.el-image-viewer__mask
			opacity: 0.7
		.el-icon-circle-close
			color:  #FFF
	.dialog-filter 
		.el-dialog
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
		min-height: 300px 
		.el-dialog__body
			height: 30%
</style>