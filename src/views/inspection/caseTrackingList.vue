<template>
	<div class="app-container case-tracking-list" v-loading="loading">
		<h2>追蹤列表</h2>
		<aside style="white-space: pre-line">
			1. 列出「中度」以上的缺失。
			<br>
			2. 超過14天標記為紅底。
		</aside>
		<div class="filter-container">
			<div v-if="listQuery.tenderRound > 0" class="filter-item">
				<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model.number="listQuery.tenderRound" class="tender-select" popper-class="type-select tender">
						<el-option v-for="(val, type) in options.tenderRoundMap" :key="type" :label="val.name" :value="Number(type)" />
					</el-select>
				</div>
			</div>
			<el-button v-if="listQuery.tenderRound > 0" type="primary" @click="getList()">搜尋</el-button>

			<el-button
				class="filter-item"
				:type="listQuery.caseType.length == 0 ? 'success' : 'danger'"
				:plain="listQuery.caseType.length != 0"
				icon="el-icon-s-order"
				@click="filterDialogOpen"
				>過濾</el-button>
			<el-button
				v-if="listQuery.caseType.length != 0"
				type="text"
				size="mini"
				@click="filterClear"
				>清空過濾條件</el-button>
		</div>

		<div class="el-input-group" style="margin-bottom: 10px; max-width: 1400px; min-width: 500px">
			<div class="el-input-group__prepend">
				<el-checkbox v-model="allHeaders" :indeterminate="partHeaders">欄位</el-checkbox>
			</div>
			<el-checkbox-group class="el-input__inner column-filter-item" v-model="headersCheckVal" style="line-height: 15px;">
				<el-checkbox v-for="(value, key) in headers" :key="key" :label="key">{{ value.name }}</el-checkbox>
			</el-checkbox-group>
		</div>

		<el-table
			empty-text="目前沒有資料"
			:data="list"
			border
			fit
			:row-class-name="tableRowClassName"
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			style="width: 100%"
		>
			<el-table-column
				v-for="(value, key) in headersFilter"
				:key="key"
				:prop="key"
				:label="value.name"
				:width="value.width"
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
					<span v-else-if="['DateReport'].includes(column.property)">
						<span>{{ row.DateReport }}</span>
						<br>
						<span :style="row.DateReportDiff >= 14 ? 'color: #F56C6C' : ''">({{ row.DateReportDiff }}天)</span>
					</span>
					<span v-else>{{ formatter(row, column) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center">
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

		<el-dialog
			class="dialog-filter"
			:visible.sync="dialogFilterVisible"
			title="過濾條件"
			width="900px"
			:show-close="false"
			center
		>
			<el-row>
				<el-col :span="6" v-for="distressId in options.distressTypeOrder" :key="distressId" style="display: flex; justify-content: space-between; width: 200px; margin-right: 10px">
					<el-checkbox v-model="checked" :label="distressId">
						{{ options.DistressType[distressId] }} ({{ caseInfo[distressId] || 0 }})
					</el-checkbox>
					<el-select v-model="typeLevel[distressId]" placeholder="請選擇" size="mini" popper-class="type-select" multiple :disabled="!checked.includes(distressId)">
						<el-option v-for="order in [0, 3, 2, 1]" :key="order" :value="order" :label="order == 0 ? '全部' : options.DistressLevel[order]" />
					</el-select>
				</el-col>
			</el-row>

			<span slot="footer" class="dialog-footer">
				<el-button @click="filterCancel">取消</el-button>
				<el-button type="primary" @click="filterConfirm">確定</el-button>
			</span>
		</el-dialog>

		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="600px">
			<map-viewer :map.sync="map"/>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderRound } from "@/api/type";
import { getCaseTrackingList } from "@/api/inspection";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

export default {
	name: "caseTrackingList",
	components: { Pagination, ElImageViewer, MapViewer },
	data() {
		return {
			loading: false,
			isUpload: false,
			showImgViewer: false,
			dialogMapVisible: true,
			dialogFilterVisible: false,
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
				tenderRound: 91,
				caseType: [],
				pageCurrent: 1,
				pageSize: 50,
			},
			headers: {
				id: {
					name: "缺失Id",
					sortable: true,
					width: 80
				},
				TrackingId: {
					name: "追蹤Id",
					sortable: false,
					width: 80
				},
				DistressType: {
					name: "缺失類型",
					sortable: true,
					width: 160
				},
				DistressLevel: {
					name: "損壞程度",
					sortable: true,
					width: 80
				},
				DateReport: {
					name: "通報時間",
					sortable: true,
					width: 150
				},
				Duty_With_Name: {
					name: "標記人員",
					sortable: false,
					width: 80
				},
				Place: {
					name: "地址",
					sortable: true
				},
				roadDir: {
					name: "車道",
					sortable: false,
					width: 110
				},
				MillingLength: {
					name: "長度(m)",
					sortable: true,
					width: 80
				},
				MillingWidth: {
					name: "寬度(m)",
					sortable: true,
					width: 80
				},
				MillingArea: {
					name: "面積(㎡)",
					sortable: true,
					width: 80
				},
				ImgZoomIn: {
					name: "近照",
					sortable: false
				},
				ImgZoomOut: {
					name: "遠照",
					sortable: false
				}
			},
			total: 0,
			list: [],
			headersCheckVal: [],
			typeLevel: {},
			caseInfo: {},
			allHeaders: true,
			options: {
				tenderRoundMap: {},
				DistressType: {
					15: "坑洞",
					29: "縱向及橫向裂縫",
					16: "龜裂",
					32: "車轍",
					18: "隆起與凹陷",
					34: "人手孔缺失",
					51: "薄層剝離",
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
				distressTypeOrder: [ 15, 29, 16, 32, 18, 34, 51, 21, 50, 53, 65, 54, 55, 56, 49, 66, 58 ],
				DistressLevel: {
					1: "輕",
					2: "中",
					3: "重"
				},
				roadDir: {
					0: "無",
					1: "順",
					2: "逆"
				}
			}
		};
	},
	computed: {
		checked: {
			get() {
				return this.listQuery.caseType.map(type => (type[0]));
			},
			set(val) {
				const caseTypeArr = this.listQuery.caseType.map(type => type[0]);
				const addTypeArr = val.filter(type => !caseTypeArr.includes(type));
				const removeTypeArr = caseTypeArr.filter(type => !val.includes(type));

				for(const type of removeTypeArr) {
					this.listQuery.caseType = this.listQuery.caseType.filter(typeArr => typeArr[0] != type);
					this.$delete(this.typeLevel, type);
				}

				for(const type of addTypeArr) {
					this.listQuery.caseType.push([type, 0]);
					this.$set(this.typeLevel, type, 0);
				}
			}
		},
		partHeaders() {
			return (this.headersCheckVal.length != 0 && this.headersCheckVal.length < Object.keys(this.headers).length);
		},
		headersFilter() {
			return Object.keys(this.headers)
			.filter(key => this.headersCheckVal.includes(key))
			.reduce((result, key) => {
				result[key] = this.headers[key];
				return result;
			}, {});
		},
	},
	watch: {
		allHeaders(val) {
			if (val) this.headersCheckVal = Object.keys(this.headers);
			else this.headersCheckVal = [];
		}
	},
	created() {
		if (this.allHeaders) this.headersCheckVal = Object.keys(this.headers);
		else this.headersCheckVal = [];

		getTenderRound().then(response => {
			this.options.tenderRoundMap = response.data.list.reduce((acc, cur) => {
				if(![1031, 1041].includes(cur.tenderId)) return acc;

				let roundId = `${cur.tenderId}${String(cur.round).padStart(3, '0')}`;
				if(cur.zipCodeSpec != 0) roundId += `${cur.zipCodeSpec}`;

				let name = `${cur.tenderName}`;
				if(cur.title.length != 0) name += `_${cur.title}`;

				acc[roundId] = { 
					id: cur.id,
					name, 
					tenderId: cur.tenderId, 
					isMain: cur.zipCodeSpec == 0,
					zipCode: cur.zipCodeSpec == 0 ? cur.zipCode : cur.zipCodeSpec, 
					roundStart: cur.roundStart, 
					roundEnd: cur.roundEnd
				};
				return acc;
			}, {});

			if(Object.keys(this.options.tenderRoundMap).length > 0) {
				if(!Object.keys(this.options.tenderRoundMap).includes(String(this.listQuery.tenderRound))) this.listQuery.tenderRound = Number(Object.keys(this.options.tenderRoundMap)[0]);
			}
			if(Object.keys(this.options.tenderRoundMap).length == 0) {
				this.options.tenderRoundMap = { "-1": { id: -1 }};
				this.listQuery.tenderRound = -1;
			}
		});
	},
	mounted() {
		this.dialogMapVisible = false;
	},
	methods: {
		tableRowClassName({row, rowIndex}) {
			if (row.DateReportDiff >= 14) return 'danger-row';
			else return '';
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
			this.caseInfo = {};
			const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];
			this.listQuery.caseType.forEach(typeArr => typeArr[1] = this.typeLevel[typeArr[0]]);

			getCaseTrackingList({
				surveyId: tenderRound.id,
				caseType: JSON.stringify(this.listQuery.caseType),
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize
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
						l.DateReportDiff = moment().diff(moment(l.DateReport), 'days');
						l.DateReport = this.formatTime(l.DateReport);
						l.MillingLength = Math.round(l.MillingLength * 100) / 100;
						l.MillingWidth = Math.round(l.MillingWidth * 100) / 100;
						l.MillingArea = Math.round(l.MillingArea * 100) / 100;

						this.$set(l, "isEdit", false);
					})
				}
				this.getImportCaseList();
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		filterDialogOpen() {
			this.dialogFilterVisible = true;
			this.caseTypeTemp = JSON.parse(JSON.stringify(this.listQuery.caseType));
		},
		filterConfirm() {
			this.listQuery.pageCurrent = 1;
			this.dialogFilterVisible = false;
			this.getList();
		},
		filterCancel() {
			this.dialogFilterVisible = false;
			this.listQuery.caseType = JSON.parse(JSON.stringify(this.caseTypeTemp));
		},
		filterClear() {
			this.listQuery.caseType = [];
			this.listQuery.pageCurrent = 1;
			this.getList();
		},
		formatter(row, column) {
			if (["DistressType"].includes(column.property)) return this.options.DistressType[row.DistressType];
			else if (["DistressLevel"].includes(column.property)) return this.options.DistressLevel[row.DistressLevel];
			else if (["roadDir"].includes(column.property)) return `${this.options.roadDir[row.Direction]}-${row.Lane}`;
			else if (!["id", "Id"].includes(column.property) && Number(row[column.property])) return (Math.round(row[column.property] * 100)/100).toLocaleString();
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
.imgHover
	max-width: 400px
	// height: 400px
.case-tracking-list
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select.tender-select
				width: 400px
				.el-input__inner
					padding-left: 10px
					text-align: left
	.el-table
		.danger-row
			background: #F9EBEB
			&.hover-row > td
				background-color: initial !important
	.img-preview
		width: 100%
		.el-image-viewer__mask
			opacity: 0.7
		.el-icon-circle-close
			color:  #FFF
	.dialog-filter
		.el-select
			width: 55px
			margin-top: -5px
			margin-bottom: 10px
			.el-input__inner
				padding: 0 13px 0 5px
				text-align: center
				background-color: transparent
			.el-input__suffix
				right: 0px
				margin-right: -3px
				transform: scale(0.7)
	.dialog-map
		min-height: 300px 
		.el-dialog__body
			height: 30%
</style>