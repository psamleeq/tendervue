<template>
	<div class="app-container inspection-progress" v-loading="loading">
		<h2>坑洞缺失</h2>
		<!-- 搜尋 -->
		<div class="filter-container">
			<el-select v-model="listQuery.contractId" class="filter-item" placeholder="請選擇" style="width: 110px;">
				<el-option label="全部" :value="99" />
				<el-option v-for="(text, id) in team" :key="`contractId${id}`" :label="text" :value="Number(id)" />
			</el-select>

			<el-select v-model="listQuery.insType" class="filter-item" placeholder="請選擇" style="width: 110px;">
				<el-option label="臨補" :value="1" />
				<el-option label="車巡" :value="2" />
			</el-select>
			
			<el-date-picker
				class="filter-item" 
				v-model="listQuery.dateRange"
				type="daterange"
				range-separator="至"
				start-placeholder="開始日期"
				end-placeholder="結束日期">
			</el-date-picker>
			<el-button size="small" class="filter-item" type="primary" icon="el-icon-search" @click="getList()" style="margin-left: 10px;">搜尋</el-button>
		</div>

		<!-- 資料列表 -->
		<el-table ref="multipleTable" empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }" style="width: 100%">
			<el-table-column 
				v-for="(value, key) in headers" 
				:key="key" :prop="key" 
				:label="value.name" 
				align="center" 
				:sortable="value.sortable"
				:width="value.width"
			>
				<template slot-scope="{ row, column }">
					<span v-if="column.property == 'CaseNo'">
						<span v-if="row.edit">
							<el-input  v-model="row.CaseNo" style="width: 80%" />
							<el-button type="text" @click="editCaseNo(row)"><i class="el-icon-check" style="color: #67C23A"/></el-button>
							<el-button type="text" style="margin-left: 5px" @click="row.edit=false"><i class="el-icon-close" style="color: #F56C6C" /></el-button> 
						</span>
						<span v-else>
							<el-link v-if="row[column.property]" :href="`https://road.nco.taipei/RoadMis2/web/ViewDefectAllData.aspx?RDT_ID=${row[column.property]}`" target="_blank">{{ row[column.property] }}</el-link>
							<span v-else> - </span>
							<el-button v-if="insTypeNow == 1" type="text" style="margin-left: 10px" size="mini" @click="row.edit = true"><i class="el-icon-edit" /></el-button>
						</span>
					</span>
					<span v-else-if="column.property == 'casename'">
						<div>{{ row.casename }}</div>
						<el-button class="btn-action" type="info" icon="el-icon-search" plain size="mini" round @click="showMapViewer(row)" />
					</span>
					<span v-else>{{ row[column.property] || "-" }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="imgfile" label="修復前圖片" align="center">
				<template slot-scope="scope">
					<div class="demo-image__preview">
						<el-image
							:src="scope.row.imgfile"
							:preview-src-list="[scope.row.imgfile]"
							fit="cover">
						<div slot="error" class="image-slot">
							<a :href="scope.row.imgfile" target="_blank">
								<i class="el-icon-picture-outline"></i>
							</a>
						</div>
						</el-image>
					</div>
					
				</template>
			</el-table-column>
			<el-table-column prop="imgfile" label="修復後圖片" align="center">
				<template slot-scope="scope">
					<div class="demo-image__preview">
						<el-image
							:src="scope.row.ImageRestored"
							:preview-src-list="[scope.row.ImageRestored]"
							fit="cover">
						<div slot="error" class="image-slot">
							<a :href="scope.row.ImageRestored" target="_blank">
								<i class="el-icon-picture-outline"></i>
							</a>
						</div>
						</el-image>
					</div>
					
				</template>
			</el-table-column>
		</el-table>

		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />

		<!-- map -->
		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="600px">
			<map-viewer :map.sync="map"/>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getPothole, setPotholeCN } from "@/api/car";
import TimePicker from '@/components/TimePicker';
import Pagination from "@/components/Pagination";
import commonMixin from '@/mixins/common';
import MapViewer from "@/components/MapViewer";

export default {
	mixins: [ commonMixin ],
	name: "pothole",
	components: { TimePicker, Pagination, MapViewer },
	data() {
		return {
			loading: false,
			dialogMapVisible: true,
			csvVisible: false,
			csvResultVisible: false,
			map: {},
			timeTabId: 1,
			total: 0,
			imgUrl: [],
			successMap: [],
			failMap: [],
			listQuery: {
				contractId: 1,
				insType: 1,
				dateRange: [ moment().startOf("week").add(1, 'day').toDate(), moment().endOf("week").add(1, 'day').toDate() ],
				pageCurrent: 1,
				pageSize: 50
			},
			insTypeNow: 0,
			team: {
				1: '第一分隊',
				2: '第二分隊',
				3: '第三分隊',
				4: '第四分隊',
				5: '第五分隊',
				6: '第六分隊'
			},
			distressLevelMap: {
				1: '輕',
				2: '中',
				3: '重'
			},
			list:[],
			rowActive: {},
			headers: {
				serialno: {
					name: '缺失Id',
					sortable: false,
				},
				CaseNo: {
					name: '新工處案號',
					sortable: false,
				},
				broketype: {
					name: '缺失程度',
					sortable: false,
				},
				elength: {
					name: '預估長',
					sortable: false,
				},
				blength: {
					name: '預估寬',
					sortable: false,
				},
				reportTime: {
					name: '創建時間',
					sortable: false,
				},
				casename: {
					name: '地址',
					sortable: false,
				},
			},
			dialogVisible: false,
			InputNotes:'',
			options: {
				tenderRoundMap: {},
				districtMap: {},
				districtOrder: [],
			}
		};
	},
	computed: {},
	watch: {},
	created() {},
	mounted() {
		this.dialogMapVisible = false;
	},
	methods: {
		getList() {
			this.loading = true;
			this.list = [];
			const [ timeStart, timeEnd ] = this.listQuery.dateRange;
			const formattedTimeStart = this.formatTime(timeStart);
			const formattedTimeEnd = this.formatTime(timeEnd);

			getPothole({
				contractId: this.listQuery.contractId,
				insType: this.listQuery.insType,
				timeStart: formattedTimeStart,
				timeEnd: formattedTimeEnd,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize,
			}).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
					this.total = 0;
				} else {
					this.insTypeNow = this.listQuery.insType;
					this.total = response.data.total;
					this.list = response.data.list;
					this.list.forEach(item => {
						item.broketype = this.distressLevelMap[item.broketype];
						item.reportTime = this.formatTime(item.reportTime);

						const codeArr = item.caseType.match(/&#(\d+);/g) || [];
						if(codeArr.length > 0) {
							item.caseType = String.fromCharCode(...codeArr.map(l => Number(l.replace(/[&#;]/g, ''))));
						}

						const codeArr2 = item.imgfile.match(/&#(\d+);/g) || [];
						for(const code of codeArr2) {
							item.imgfile = item.imgfile.replace(code, String.fromCharCode(Number(code.replace(/[&#;]/g, ''))));
						}
						item.imgfile = /^https:\/\//.test(item.imgfile) ? item.imgfile : `http://center.bim-group.com${item.imgfile}`;

						this.$set(item, "edit", false);
					});
				}
				this.loading = false;
			}).catch(err => { this.loading = false });
		},
		editCaseNo(row){
			setPotholeCN(row.serialno, {
				caseNo: row.CaseNo
			}).then(response => {
				this.$message({
					type: 'success',
					message: `修改成功!`
				})
				this.getList();
			}).catch(err => this.loading = false);
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

			geoJSON_case.features.push({
				"type": "Feature",
				"properties": { },
				"geometry": {
					"type": "Point",
					"coordinates": [ Number(row.yy), Number(row.xx) ]
				}
			});

			this.map.data.addGeoJson(geoJSON_case);
			this.map.data.setStyle({ 
				strokeColor: '#F56C6C',
				strokeWeight: 3,
				strokeOpacity: 0.9,
				fillColor: '#F56C6C',
				fillOpacity: 0.8
			});

			this.map.setCenter({ lat: Number(row.xx), lng: Number(row.yy) });

			const zoom = this.map.getZoom();
			this.map.setZoom(zoom < 21 ? 21 : zoom);
		},
		formatTime(time) {
			return time ? moment(time).format("YYYY/MM/DD") : "";
		}
	}
};
</script>

<style lang="sass">
.inspection-progress
	.el-table
		.success-row
			background: #f0f9eb
		.warning-row
			background: oldlace
	.dialog-footer
		display: flex
		justify-content: center
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 80px
				.el-input__inner
					padding-left: 8px
					padding-right: 10px
				.el-input__suffix
					right: 0
					margin-right: -3px
					transform: scale(0.7)
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
			.el-select.tender-select
				width: 240px
				.el-input__inner
					padding-left: 8px
					padding-right: 10px
					text-align: left
				.el-input__suffix
					right: 0
					margin-right: -3px
					transform: scale(0.7)
</style>
