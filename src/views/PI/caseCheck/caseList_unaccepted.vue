<template>
	<div class="app-container unaccepted-PI-case-list" v-loading="loading">
		<h2>不合理案件申覆</h2>
		<div class="filter-container">
			<el-select class="filter-item" v-model="listQuery.zipCode" :disabled="Object.keys(districtList).length <= 1">
				<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="Number(zip)" />
			</el-select>
			<span class="time-picker">
				<el-button-group v-if="!dateTimePickerVisible">
					<el-button
						v-for="(t, i) in pickerOptions.shortcuts"
						:key="i"
						type="primary"
						:plain="i != timeTabId"
						size="mini"
						@click="dateShortcuts(i)"
					>{{ t.text }}</el-button>
				</el-button-group>
				<el-date-picker
					v-else
					class="filter-item"
					v-model="searchDate"
					type="date"
					placeholder="日期"
					:picker-options="pickerOptions"
					:clearable="false"
					@change="timeTabId = -1"
				/>
				<el-button
					:type="dateTimePickerVisible ? 'info' : 'primary'"
					plain
					size="mini"
					@click="dateTimePickerVisible = !dateTimePickerVisible"
				>{{ dateTimePickerVisible ? '返回' : '進階' }}</el-button>
				<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
			</span>

			<el-button
				slot="reference"
				v-if="checkPermission(['PIcase.editor'])"
				class="filter-item"
				type="info"
				icon="el-icon-document"
				:disabled="list.length == 0"
				@click="handleDownload"
			>輸出報表</el-button>
		</div>
		
		<h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5>

		<!-- 資訊列表 -->
		<el-row :gutter="40" class="panel-group">
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-icon-wrapper icon-form">
						<svg-icon icon-class="form" class-name="card-panel-icon" />
					</div>
					<div class="card-panel-description">
						<div class="card-panel-text">不合理案件數</div>
						<div class="card-panel-num">{{ list.length }}</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-icon-wrapper icon-people">
						<svg-icon icon-class="people" class-name="card-panel-icon" />
					</div>
					<div class="card-panel-description">
						<div class="card-panel-text">監造審核</div>
						<div class="card-panel-num"> 
							{{ checkNum.SV.check }} <span class="fail-num">({{ checkNum.SV.fail }})</span>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-icon-wrapper icon-domain">
						<svg-icon icon-class="domain" class-name="card-panel-icon" />
					</div>
					<div class="card-panel-description">
						<div class="card-panel-text">機關審核</div>
						<div class="card-panel-num">
							{{ checkNum.Organ.check }} <span class="fail-num">({{ checkNum.Organ.fail }})</span>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-icon-wrapper icon-message-alert">
						<svg-icon icon-class="message-alert" class-name="card-panel-icon" />
					</div>
					<div class="card-panel-description">
						<div class="card-panel-text">通過件數</div>
						<div class="card-panel-num">
							<span> {{ checkNum.pass }}</span>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>

		<br />

		<!-- 案件列表 -->
		<el-table
			empty-text="目前沒有資料"
			:data="list"
			border
			fit
			highlight-current-row
			:header-cell-style="{'background-color': '#F2F6FC'}"
			stripe
			style="width: 100%"
		>
			<el-table-column label="序號" type="index" width="40" align="center" />
			<!-- <el-table-column label="案件編號" prop="UploadCaseNo" align="center">
				<template slot-scope="{ row }">
					<template v-if="row.edit">
						<el-input
							v-model="row.UploadCaseNo"
							size="mini"
							style="width: 100px"
						/>
						<el-button type="text" @click="row.edit = false;">
							<i class="el-icon-success" />
						</el-button>
						<el-button type="text" @click="row.edit = false; getList()">
							<i class="el-icon-error" />
						</el-button>
					</template>
					<template v-else>
						<span>{{ row.UploadCaseNo || "-" }}</span>
						<el-link v-if="!row.UploadCaseNo" @click="row.edit = true" style="margin-left: 5px">
							<i class="el-icon-edit" />
						</el-link>
					</template>
				</template>
			</el-table-column> -->
			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:width="['StateNotes'].includes(key) ? 250 : ['organAssign'].includes(key) ? 60 : ['CaseDate', 'DeviceType', 'BType', 'BrokeStatus'].includes(key) ? 115 : null"
				:formatter="formatter"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="column.property == 'UploadCaseNo'"> <el-link :href="`https://road.nco.taipei/RoadMis2/web/ViewDefectAllData.aspx?RDT_ID=${row[column.property]}`" target="_blank">{{ row[column.property] }}</el-link></span>
					<span v-else-if="checkPermission(['PIcase.editor']) && [ 'State', 'StateNotes' ].includes(column.property)">
						<span v-if="[ 'StateNotes' ].includes(column.property) && row.edit">
							<input v-if="[ 'StateNotes' ].includes(column.property)" v-model="row[column.property]" />
							<el-button type="text" @click="rowActive = row; setResult();">
								<i class="el-icon-success" />
							</el-button>
							<el-button type="text" @click="row.edit = false; getList()">
								<i class="el-icon-error" />
							</el-button>
						</span>
						<span v-else-if="[ 'State' ].includes(column.property)">
							<el-button v-if="!(row.State & 1)" class="btn-revoke" type="danger" size="mini" plain round @click="beforeReply(row, 1)">申覆</el-button>
							<el-button v-else class="btn-revoke" size="mini" plain round @click="beforeReply(row, 0)">撤銷</el-button>
						</span>
						<span v-else>
							<span>{{ formatter(row, column) }}</span>
							<el-link @click="row.edit = true" style="margin-left: 5px">
								<i class="el-icon-edit" />
							</el-link>
						</span>
					</span>
					<span v-else>{{ formatter(row, column) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="監造審核" width="100px" align="center">
				<template slot-scope="{ row }">
					<template v-if="!(row.State & 2) && checkPermission(['PIcase.inspector']) && row.SVCheck == 0">
						<el-button-group>
							<el-button type="success" size="mini" @click="beforeSetResult(row, 2)">通過</el-button>
						</el-button-group>
					</template>
					<template v-else>
						<span v-if="row.State & 1">
							<i v-if="row.State & 2" class="el-icon-check" style="color: #67C23A; font-weight: bold;" />
							<i v-else-if="!(row.State & 2)" class="el-icon-close" style="color: #F56C6C; font-weight: bold;" />
							<el-button v-if="checkPermission(['PIcase.inspector'])" class="btn-revoke" size="mini" plain round @click="beforeSetResult(row, -2)">撤銷</el-button>
						</span>
						<span v-else> - </span>
					</template>
				</template>
			</el-table-column>
			<el-table-column label="機關審核" width="100px" align="center">
				<template slot-scope="{ row }">
					<template v-if="(row.State & 2) && !(row.State & 4) && checkPermission(['PIcase.supervisor']) && row.OrganCheck == 0">
						<el-button-group>
							<el-button type="success" size="mini" @click="beforeSetResult(row, 4)">通過</el-button>
						</el-button-group>
					</template>
					<template v-else>
						<span v-if="row.State & 2">
							<i v-if="row.State & 4" class="el-icon-check" style="color: #67C23A; font-weight: bold;" />
							<i v-else-if="!(row.State & 4)" class="el-icon-close" style="color: #F56C6C; font-weight: bold;" />
							<el-button v-if="checkPermission(['PIcase.supervisor'])" class="btn-revoke" size="mini" plain round @click="beforeSetResult(row, -4)">撤銷</el-button>
						</span>
						<span v-else> - </span>
					</template>
				</template>
			</el-table-column>

			<!-- NOTE: 展示用，還未實作 -->
			<el-table-column label="操作" width="80px" align="center">
				<template slot-scope="{ row }">
					<el-button class="btn-action" type="info" plain size="mini" round disabled @click="showMap(row)">地圖</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 不合理案件Dialog -->
		<el-dialog
			:visible.sync="showUnacceptedConfirm"
			width="300px"
			:show-close="false"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
		>	
			<span slot="title">確認{{ rowActive.State > 0 ? "標記" : "撤銷" }} {{ rowActive.UploadCaseNo }}為「不合理案件」？</span>
			<div>來源案號: {{ rowActive.CaseNo }}</div>
			<span v-if="rowActive.State > 0">
				<div style="color: #F56C6C">(將會清除抽查結果。)</div>
				<br>
				<div>原因: 
					<el-input v-model="rowActive.StateNotes" />
				</div>
			</span>
			<span slot="footer" class="footer-btns">
				<el-button @click="showUnacceptedConfirm = false; getList();">取消</el-button>
				<el-button type="primary" @click="setResult()">確定</el-button>
			</span>
		</el-dialog>

		<!-- 抽查結果Dialog -->
		<el-dialog
			:visible.sync="showResultConfirm"
			width="300px"
			:show-close="false"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
		>	
			<span slot="title">確認提交 {{ rowActive.UploadCaseNo }}的審核結果？</span>
			<div>來源案號: {{ rowActive.CaseNo }}</div>
			<div v-if="rowActive.resultType < 0" style="color: #F56C6C" >撤銷審核</div>
			<div v-else>審核結果: <span style="color: #67C23A">通過</span></div>
			<span slot="footer" class="footer-btns">
				<el-button @click="showResultConfirm = false; getList();">取消</el-button>
				<el-button type="primary" @click="setResult()">確定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getTypeMap } from "@/api/type";
import { getUnacceptedCaseList, setCaseList } from "@/api/PI";
import checkPermission from '@/utils/permission';

export default {
	name: "PICaseList_unaccepted",
	data() {
		return {
			loading: false,
			timeTabId: 1,
			dateTimePickerVisible: false,
			showResultConfirm: false,
			showUnacceptedConfirm: false,
			pickerOptions: {
				firstDayOfWeek: 1,
				shortcuts: [
					{
						text: "今日",
						onClick(picker) {
							const date = moment();
							picker.$emit("pick", date);
						},
					},
					{
						text: "昨日",
						onClick(picker) {
							const date = moment().subtract(1, "d");
							picker.$emit("pick", date);
						}
					},
					{
						text: "前日",
						onClick(picker) {
							const date = moment().subtract(2, "d");
							picker.$emit("pick", date);
						}
					}
				],
				disabledDate(date) {
					return moment(date).valueOf() >= moment().endOf("d").valueOf();
				},
			},
			searchDate: moment().startOf("d").subtract(1, "d"),
			searchRange: "",
			zipCodeNow: 0,
			listQuery: {
				zipCode: 104
			},
			resultHeader: {
				UploadCaseNo: {
					name: "案件編號",
					sortable: true
				}
			},
			headers: {
				UploadCaseNo: {
					name: "案件編號",
					sortable: true
				},
				CaseDate: {
					name: "成案日期",
					sortable: false,
				},
				DeviceType: {
					name: "設施類型",
					sortable: true
				},
				organAssign: {
					name: "機關交辦",
					sortable: false
				},
				CaseName: {
					name: "地址",
					sortable: false
				},
				CaseNo: {
					name: "來源案號",
					sortable: true
				},
				// CaseType: {
				// 	name: "損壞情況",
				// 	sortable: false
				// },
				BType: {
					name: "損壞態樣",
					sortable: false
				},
				// BrokeType: {
				// 	name: "損壞程度",
				// 	sortable: false
				// },
				BrokeStatus: {
					name: "損壞狀況",
					sortable: false
				},
				// PCIValue: {
				// 	name: "PCI",
				// 	sortable: false
				// },
				StateNotes: {
					name: "判定原因",
					sortable: false
				},
				State: {
					name: "廠商審核",
					sortable: false
				}
			},
			list: [],
			rowActive: {},
			districtList: {
				// 100: {
				// 	"name": "中正區"
				// },
				103: {
					"name": "大同區"
				},
				104: {
					"name": "中山區"
				},
				// 105: {
				// 	"name": "松山區"
				// },
				// 106: {
				// 	"name": "大安區"
				// },
				// 108: {
				// 	"name": "萬華區"
				// },
				// 110: {
				// 	"name": "信義區"
				// },
				// 111: {
				// 	"name": "士林區"
				// },
				// 112: {
				// 	"name": "北投區"
				// },
				// 114: {
				// 	"name": "內湖區"
				// },
				// 115: {
				// 	"name": "南港區"
				// },
				// 116: {
				// 	"name": "文山區"
				// }
			},
			options: {
				DeviceType: {},
				BType: {},
				BrokeStatus: {
					1: "觀察", //輕度
					2: "短期改善", //中度
					3: "立即改善", //重度
				},
			}
		};
	},
	computed: { 
		checkNum() {
			return { 
				SV: { 
					check: this.list.filter(l => l.State & 2 ).length, 
					fail: this.list.filter(l => !(l.State & 2)).length
				}, 
				Organ: { 
					check: this.list.filter(l =>  l.State & 4).length, 
					fail: this.list.filter(l => !(l.State & 4)).length
				},
				pass: this.list.filter(l =>  (l.State & 2) && (l.State & 4)).length
			};
		}
	},
	created() {
		getTypeMap().then(response => {
			this.options.DeviceType = response.data.DeviceTypeMap;
			this.options.BType = response.data.BTypeMap;
		});
		this.getList();
	},
	methods: {
		checkPermission,
		dateShortcuts(index) {
			this.timeTabId = index;

			const DATE_OPTION = {
				TODAY: 0,
				YESTERDAY: 1,
				DAYBEFOREYEST: 2
			};

			switch (index) {
				case DATE_OPTION.TODAY:
					this.searchDate = moment();
					break;
				case DATE_OPTION.YESTERDAY:
					this.searchDate = moment().subtract(1, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST:
					this.searchDate = moment().subtract(2, "d");
					break;
			}
			this.getList();
		},
		getList() {
			this.loading = true;
			let date = moment(this.searchDate).format("YYYY-MM-DD");
			this.searchRange = date;
			this.list = [];

			getUnacceptedCaseList({
				zipCode: this.listQuery.zipCode,
				timeStart: date,
				timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD")
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.zipCodeNow = this.listQuery.zipCode;
					this.list = response.data.list;
					this.list.forEach(l => {
						this.$set(l, "showSVCheck", false);
						this.$set(l, "showOrganCheck", false);
						this.$set(l, "edit", false);
					})
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
		beforeReply(row, result) {
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.rowActive.State = result;
			this.showUnacceptedConfirm = true;
		},
		beforeSetResult(row, result) {
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.rowActive.resultType = result;
			this.rowActive.State += result;
			if(!(this.rowActive.State & 2)) this.rowActive.State = 1;
			this.showResultConfirm = true;
		},
		setResult() {
			this.showUnacceptedConfirm = false;
			this.showResultConfirm = false;

			if(this.rowActive.State == 0) this.rowActive.StateNotes = '';

			setCaseList( this.rowActive.id, {
				zipCode: this.zipCodeNow,
				organAssign: this.rowActive.organAssign,
				BType: this.rowActive.BType,
				BrokeType: this.rowActive.BrokeType,
				PCIValue: this.rowActive.PCIValue,
				State: this.rowActive.State,
				StateNotes: this.rowActive.StateNotes
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "提交成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		formatter(row, column) {
			if([ 'organAssign', 'State' ].includes(column.property)) return row[column.property] == 1 ? '是' : '-';
			else if(column.property == 'DeviceType') return this.options.DeviceType[row[column.property]];
			else if(column.property == 'BType') return this.options.BType[row[column.property]];
			// else if(column.property == 'BrokeType') return this.options.BrokeType[row[column.property]];
			else if(column.property == 'BrokeStatus') return this.options.BrokeStatus[row.BrokeType];
			else if(column.property.indexOf('Date') != -1) return row[column.property] ? this.formatTime(row[column.property]) : "-";
			else if(column.property.indexOf('Area') != -1) return Number(row[column.property]) ? row[column.property].toLocaleString() : "-";
			else return row[column.property] && row[column.property] != '0' ? row[column.property] : "-";
		},
		formatTime(time) {
			return moment(time).format("YYYY/MM/DD");
		},
		handleDownload() {
			console.log("handleDownload");
			const tHeader = Object.values(this.headers).map(value => value.name).concat(["監造審核", "機關審核", "通過"]);
			const filterVal = Object.keys(this.headers).concat(["SVCheck", "OrganCheck", "Pass"]);
			// tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ];
			// filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ];
			const dataList = JSON.parse(JSON.stringify(this.list)).map(l => {
				l.CaseDate = this.formatTime(l.CaseDate);
				l.DeviceType = this.options.DeviceType[l.DeviceType];
				l.organAssign =  l.organAssign == 1 ? "是" : "";
				l.BType = this.options.BType[l.BType];
				l.BrokeStatus = this.options.BrokeStatus[l.BrokeType];
				l.SVCheck = (l.State & 2) ? "V" : "-";
				l.OrganCheck = (l.State & 4) ? "V" : "-";
				l.Pass = (l.State & 2) && (l.State & 4) ? "V" : "-";
				l.State = (l.State & 1) ? "V" : "-";
				return l
			}) 
			const data = this.formatJson(filterVal, dataList);

			import("@/vendor/Export2Excel").then((excel) => {
				excel.export_json_to_excel({
					header: tHeader,
					data,
				});
			});
			this.getList();
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
.unaccepted-PI-case-list
	height: calc(100vh - 50px)
	overflow: scroll
	.filter-container 
		.el-select
			width: 110px
		.el-input__inner
			padding-left: 5px
			text-align: center
		.filter-item
			margin-right: 5px
		.time-picker 
			& > *
				margin-right: 5px
			.el-date-editor.el-input
				width: 165px
				.el-input__inner
					width: 155px
					padding: 0 10px
	.panel-group 
		position: sticky
		top: -20px
		display: flex
		align-items: center
		background-color: rgba(#fff, 1)
		box-shadow: 0 5px 5px rgba(#eee, 0.1)
		width: calc(100% + 40px)
		margin: 0 !important
		transform: translateX(-15px)
		padding: 5px
		// margin: 5px 0
		// margin-top: 18px
		z-index: 2
		.card-panel-col 
			position: relative
			margin: auto
		.card-panel 
			height: 125px
			font-size: 12px
			position: relative
			// overflow: hidden
			color: #666
			background: #fff
			box-shadow: 4px 4px 40px rgba(0, 0, 0, .05)
			border-color: rgba(0, 0, 0, .05)
			display: flex
			justify-content: space-around
			align-items: center
			&:hover 
				.card-panel-icon-wrapper 
					color: #fff
				.icon-form
					background: #40c9c6
				.icon-people
					background: #36a3f7
				.icon-domain
					background: #FF9800
				.icon-message-alert
					background: #f4516c
			.icon-form
				color: #40c9c6
			.icon-people
				color: #36a3f7
			.icon-domain
				color: #FF9800
			.icon-message-alert
				color: #f4516c
			.card-panel-icon-wrapper 
				float: left
				margin: 14px 0 0 14px
				padding: 16px
				transition: all 0.38s ease-out
				border-radius: 6px
			.card-panel-icon 
				float: left
				font-size: 48px
			.card-panel-description 
				float: right
				font-weight: bold
				margin: 26px
				margin-left: 0px
				.card-panel-text 
					line-height: 18px
					color: rgba(0, 0, 0, 0.45)
					font-size: 16px
					margin-bottom: 12px
				.card-panel-num 
					font-size: 18px
					.fail-num
						color: #F56C6C
						// font-size: 20px
						vertical-align: text-top

	.el-icon-edit
		color: #67C23A
		margin-bottom: 5px
		&:hover
			color: white
			background-color: #67C23A
			border-radius: 50%
	.el-icon-success
		margin-right: -10px
	.el-icon-error
		color: #F56C6C
	.el-select.edit-select
		width: 85px
		.el-input__inner
			padding-left: 3px
			padding-right: 10px
		.el-input__suffix
			right: 0
			margin-right: -3px
			transform: scale(0.7)
	.edit-number.el-input-number .el-input__inner
		padding: 0 10px
		text-align: left
	.btn-revoke
		padding: 5px 10px
		margin-left: 5px
	.el-dialog
		.el-dialog__body > div
			margin-top: 10px
		.el-select
			margin-top: 5px
			width: 250px
		.footer-btns
			display: flex
			justify-content: center
</style>