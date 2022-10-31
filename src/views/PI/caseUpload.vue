<template>
	<div class="app-container PI-case-upload" v-loading="loading">
		<h2>案件上傳</h2>
		<div class="filter-container">
			<el-select class="filter-item" v-model="listQuery.dist" :disabled="Object.keys(districtList).length <= 1">
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
			<!-- <el-button
				class="filter-item"
				type="info"
				icon="el-icon-document"
				:circle="screenWidth<567"
				@click="handleDownload"
			>輸出報表</el-button> -->

			<el-upload v-if="!alreadyCreate" :class="[ 'filter-item', 'upload-csv', { 'is-ready' : csvFileList.length > 0 }]" ref="uploadFile" action accept=".csv" :multiple="false" :limit="1" :auto-upload="false" :file-list="csvFileList" :on-change="readCSV" :on-remove="handleRemove">
				<!-- <i class="el-icon-upload" />
				<div class="el-upload__text">將CSV拖曳至此處，或<em>點此上傳</em></div> -->
				<el-button type="info">上傳CSV</el-button>
			</el-upload>
			<transition name="el-fade-in">
				<el-button v-if="csvFileList.length > 0" type="success" @click="showConfirm = true">建立列表</el-button>
			</transition>
			<el-button type="text" @click="showDemo = true">CSV範例</el-button>
		</div>
		
		<h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5>

		<aside>
			<span v-if="this.caseList.length != 0"> 案件數: {{ this.caseList.length }} </span>
			<span v-if="this.tableSelect.length != 0">  勾選: {{ this.tableSelect.length }} </span>
		</aside>

		<!-- 有問題案件列表 -->
		<el-collapse v-if="!alreadyCreate && caseErrList.length != 0">
			<el-collapse-item class="listLabel" title="需處理案件" name="1">
				<template slot="title">
					<span>需處理案件  (</span>
					<span style="color: #F56C6C">無法匹配: {{ caseMinus.list.length + caseMinus.csv.length }}件</span>、
					<span style="color: #E6A23C">重複案件: {{ Object.values(csvRepeatObj).reduce((acc, curr) => acc+=curr.length , 0) }}件</span>
					)
				</template>
				<el-table
					empty-text="目前沒有資料"
					:data="caseErrList"
					border
					fit
					highlight-current-row
					:header-cell-style="{'background-color': '#F2F6FC'}"
					stripe
					style="width: 100%"
					@selection-change="handleSelectionChange"
				>
					<el-table-column type="selection" width="55" align="center" />
					<!-- <el-table-column label="案件編號" prop="UploadCaseNo" :sortable="true" align="center">
						<template slot-scope="{ row }">
							<template v-if="row.edit">
								<el-input
									v-model="row.UploadCaseNo"
									size="mini"
									style="width: 100px"
								/>
								<el-button type="text" @click="editCase(row)">
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
						:formatter="formatter"
						:sortable="value.sortable"
					>
						<template slot-scope="{ row, column }">
							<span v-if="[ 'CaseNo' ].includes(column.property)">
								<template v-if="row.edit">
									<el-input
										v-model="row[column.property]"
										size="mini"
										style="width: 100px"
									/>
									<el-button type="text" @click="row.edit = false">
										<i class="el-icon-success" />
									</el-button>
									<el-button type="text" @click="row.edit = false">
										<i class="el-icon-error" />
									</el-button>
								</template>
								<template v-else>
									<span>{{ row[column.property] || "-" }}</span>
									<el-link v-if="column.property == 'CaseNo' || !row[column.property]" @click="row.edit = true" style="margin-left: 5px">
										<i class="el-icon-edit" />
									</el-link>
								</template>
							</span>
							<span v-else-if="[ 'DeviceType', 'BType', 'BrokeType' ].includes(column.property)">
								<el-select v-model.number="row[column.property]">
									<el-option v-for="(name, type) in options[column.property]" :key="`${column.property}_${type}`" :label="name" :value="Number(type)" />
								</el-select>
							</span>
							<span v-else>{{ formatter(row, column) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="備註" align="center">
						<template slot-scope="{ row }">
							<span>{{ row.note || "-" }}</span>
						</template>
					</el-table-column>
				</el-table>
			</el-collapse-item>
		</el-collapse>
		<br>

		<!-- 案件列表 -->
		<el-table
			empty-text="目前沒有資料"
			:data="caseList"
			border
			fit
			highlight-current-row
			:header-cell-style="{'background-color': '#F2F6FC'}"
			stripe
			style="width: 100%"
		>
			<el-table-column label="序號" type="index" width="55" align="center" />
			<!-- <el-table-column label="案件編號" prop="UploadCaseNo" :sortable="true" align="center">
				<template slot-scope="{ row }">
					<template v-if="row.edit">
						<el-input
							v-model="row.UploadCaseNo"
							size="mini"
							style="width: 100px"
						/>
						<el-button type="text" @click="editCase(row)">
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
				:formatter="formatter"
				:sortable="value.sortable"
			/>
		</el-table>

		<el-dialog
			:visible.sync="showConfirm"
			width="300px"
			:show-close="false"
			center
		>	
			<span slot="title">確認建立{{ searchRange }}案件列表</span>
			<h3>案件數: {{ caseList.length + tableSelect.length }}件</h3>
			<span slot="footer" class="footer-btns">
				<el-button @click="showConfirm = false; getList();">取消</el-button>
				<el-button type="primary" @click="createList()">確定</el-button>
			</span>
		</el-dialog>

		<el-dialog :visible.sync="showDemo" width="1110px" center>
			<span slot="title">220915.csv (<el-link href="/demo/220915.csv" target="_blank">下載<i class="el-icon-download" /></el-link>)</span>
			<iframe width="100%" height="600" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSENg_DyEurfd0ZDBFugZTBSTNyCJrUe2xxliAhrXYO4AIeHBpNkTjiQAmQgthjCLGZPxplxfF-xSAH/pubhtml?gid=1382937779&single=true&widget=false&headers=false&chrome=false" />
		</el-dialog>

	</div>
</template>

<script>
import moment from "moment";
import jschardet from "jschardet";
import iconv from "iconv-lite";
import { getTypeMap } from "@/api/type";
import { getCaseList, addCaseList } from "@/api/PI";

export default {
	name: "PICaseUpload",
	data() {
		return {
			loading: false,
			timeTabId: 1,
			dateTimePickerVisible: false,
			showConfirm: false,
			showDemo: false,
			alreadyCreate: false,
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
			listQuery: {
				dist: 104
			},
			headers: {
				UploadCaseNo: {
					name: "案件編號",
					sortable: true
				},
				CaseDate: {
					name: "查報日期",
					sortable: false,
				},
				DeviceType: {
					name: "設施類型",
					sortable: false
				},
				CaseName: {
					name: "查報地點",
					sortable: false
				},
				CaseNo: {
					name: "來源編號",
					sortable: true
				},
				CaseType: {
					name: "損壞情況",
					sortable: false
				},
				BType: {
					name: "損壞態樣",
					sortable: false
				},
				BrokeType: {
					name: "損壞程度",
					sortable: false
				}
			},
			csvHeader: [ "案件編號", "查報日期", "來源編號", "查報地點", "損壞情況" ],
			apiHeader: [ "UploadCaseNo", "CaseSN", "CaseDate", "DeviceType", "CaseName", "CaseNo", "BType", "BrokeType", "CaseType" ],
			tableSelect: [],
			list: [],
			csvData: [],
			csvFileList: [],
			csvRepeatObj: {},
			caseMinus: { 
				list: [],
				csv: []
			},
			districtList: {
				// 100: {
				// 	"name": "中正區",
				// 	"engName": "Zhongzheng"
				// },
				// 103: {
				// 	"name": "大同區",
				// 	"engName": "Datong"
				// },
				104: {
					"name": "中山區",
					"engName": "Zhongshan"
				},
				// 105: {
				// 	"name": "松山區",
				// 	"engName": "Songshan"
				// },
				// 106: {
				// 	"name": "大安區",
				// 	"engName": "Da’an"
				// },
				// 108: {
				// 	"name": "萬華區",
				// 	"engName": "Wanhua",
				// },
				// 110: {
				// 	"name": "信義區",
				// 	"engName": "Xinyi"
				// },
				// 111: {
				// 	"name": "士林區",
				// 	"engName": "Shilin"
				// },
				// 112: {
				// 	"name": "北投區",
				// 	"engName": "Beitou"
				// },
				// 114: {
				// 	"name": "內湖區",
				// 	"engName": "Neihu"
				// },
				// 115: {
				// 	"name": "南港區",
				// 	"engName": "Nangang"
				// },
				// 116: {
				// 	"name": "文山區",
				// 	"engName": "Wenshan"
				// }
			},
			options: {
				DeviceType: {},
				BType: {},
				BrokeType: {
					1: "輕度",
					2: "中度",
					3: "重度"
				}
			}
		};
	},
	computed: {
		caseList() {
			const errArr = this.caseErrList.map(l => l.CaseNo.length > 0 ? l.CaseNo : l.UploadCaseNo );
			return this.list.filter(row => (!errArr.includes(row.CaseNo) || (row.casetype != '1999' && row.UploadCaseNo && !errArr.includes(row.UploadCaseNo))));
		},
		caseErrList() {
			let caseErrList = [];
			for(const caseNo of this.caseMinus.list) {
				const caseItem = this.list.filter(l => l.CaseNo == caseNo)[0];
				if(caseItem.UploadCaseNo == undefined) caseItem.UploadCaseNo = caseItem.CaseNo;
				caseErrList.push({ ...caseItem, note: `無法匹配(DB) \n ${caseItem.casetype}`, edit: false });
			}

			for(const caseNo of this.caseMinus.csv) {
				const caseFilter = this.csvData.filter(d => d["來源編號"] == caseNo || d["案件編號"] == caseNo)[0];
				// let caseItem = { UploadCaseNo: caseFilter["案件編號"] };
				let caseItem = {};
				Object.keys(this.headers).forEach(key => caseItem[key] = caseFilter[this.headers[key].name]);
				// if(caseItem.CaseNo.length == 0) caseItem.CaseNo = caseItem.UploadCaseNo;
				caseErrList.push({ ...caseItem, note: "無法匹配(csv)", edit: false });
			}

			for(const caseNo in this.csvRepeatObj) {
				for(const uploadCaseNo of this.csvRepeatObj[caseNo]) {
					const caseItem = this.list.filter(l => l.UploadCaseNo == uploadCaseNo)[0];
					caseErrList.push({ ...caseItem, note: `重複案件: ${caseNo}`, edit: false });
				}
			}

			return caseErrList.sort((a, b) => Number(a.UploadCaseNo) - Number(b.UploadCaseNo))
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
			this.csvRepeatObj = {};
			this.caseMinus = { 
				list: [],
				csv: []
			};
			getCaseList({
				isList: false,
				timeStart: date,
				timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD"),
			}).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
					this.list.forEach(l => {
						l.DeviceType = Number(l.DeviceType);
						l.BType = Number(l.BType);
						l.BrokeType = Number(l.BrokeType);
					})
					this.alreadyCreate = !response.data.isRMDB;
					if(this.alreadyCreate) this.handleRemove();
				}
				if(this.csvFileList.length > 0) this.checkCsv();
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
		caseFilterList(list) {
			// console.log(list);
			let caseFilterList = [];
			for(const row of list) {
				let caseItem = {};
				for(const key of this.apiHeader) caseItem[key] = row[key];
				caseFilterList.push(caseItem);
			}

			return caseFilterList;
		},
		createList() {
			this.showConfirm = false;
			this.loading = true;
			this.tableSelect.forEach(l => l.CaseNo = l.CaseNo.length == 0 ? '0' : l.CaseNo);

			addCaseList({
				caseList: this.caseFilterList([...this.caseList, ...this.tableSelect ])
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "建立成功",
						type: "success",
					});

					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		async handleSelectionChange(value) {
			const delay = (n) => new Promise( r => setTimeout(r, n*1000));
			for(const val of value) {
				let msgArr = [];
				for(const column in this.headers) {
					if(!val[column]) msgArr.push(`「${this.headers[column].name}」`);
				}
				if(msgArr.length > 0) {
					this.$message({
						type: "warning",
						message: `請填入${val.UploadCaseNo}的${msgArr.join("、")}`
					});

					await delay(0.5);
				}
			}
			this.tableSelect = val;
		},
		formatter(row, column) {
			if(column.property == 'DeviceType') return this.options.DeviceType[row[column.property]];
			else if(column.property == 'BType') return this.options.BType[row[column.property]];
			else if(column.property == 'BrokeType') return this.options.BrokeType[row[column.property]];
			else if(column.property.indexOf('Date') != -1) return row[column.property] ? this.formatTime(row[column.property]) : "-";
			else if(column.property.indexOf('Area') != -1) return Number(row[column.property]) ? row[column.property].toLocaleString() : "-";
			else return row[column.property] && row[column.property] != '0' ? row[column.property] : "-";
		},
		formatTime(time) {
			return moment(time).format("YYYY/MM/DD");
		},
		readCSV(file, fileList) {
			if(fileList.length > 1) fileList.shift();
			this.csvFileList = JSON.parse(JSON.stringify(fileList));

			if(file.raw.type != "text/csv") {
				this.$message({
					type: "warning",
					message: "文件類型不符，請重新上傳正確csv"
				});
				this.handleRemove(); 
			} else {
				this.loading = true;
				let reader = new FileReader();
				// reader.readAsText(file.raw, "UTF-8");
				reader.readAsArrayBuffer(file.raw);
				reader.onload = (evt) => {
					// 讀取CSV內容
					// const fileString = evt.target.result;
					const buffer = Buffer.from(evt.target.result);
					const type = jschardet.detect(buffer);
					// console.log(type);
					const fileString = iconv.decode(buffer, type.encoding);

					//轉成array
					this.csvData = this.csvToArray(fileString);
					this.checkCsv();
				}
			}
		},
		checkCsv() {
			const fileHeaders = Object.keys(this.csvData[0]);
			let lackHeaderList = [];
			for(const header of this.csvHeader) {
				if(!fileHeaders.includes(header)) lackHeaderList.push(header);
			}

			if(lackHeaderList.length != 0) {
				this.$message({
					type: "warning",
					message: `csv缺少欄位${lackHeaderList.map(l => `「${l}」`).join("、")}，請重新上傳正確csv`
				});
				this.handleRemove(); 
			} else {
				this.replaceCaseList();
			}
		},
		csvToArray(str, delimiter = ",") {
			const headers = str.slice(0, str.indexOf("\n")).split(delimiter).map(header => header.replace(/\r\n/g,'').trim());
			const rows = str.slice(str.indexOf("\n") + 1).split("\n").filter(row => row.length != 0);
			const regex = /("[^"]+"|[^,]+)*,/g;

			const result = rows.map(row => {
				const values = row.split(regex).filter(row => row == undefined || row.length != 0).map(row => {
					if(row == undefined) return row = '';
					else return row.replace(/\r\n|\"/g,'').trim();
				});

				return headers.reduce((object, header, index) => {
					if(header == "查報日期") object[header] = moment(values[index]).add(1911, 'year').format("YYYY/MM/DD");
					else object[header] = values[index];
					return object;
				}, {});
			});	

			return result.sort((a, b) => Number(a["來源編號"].replace(/[^0-9]/ig,"")) - Number(b["來源編號"].replace(/[^0-9]/ig,"")))
		},
		replaceCaseList() {
			// 比對 DB 和 新工處
			const listCSNArr = this.list.map(l => l.CaseNo);
			const csvCSNArr = this.csvData.map(d => d["來源編號"].length > 0 ? d["來源編號"] : d["案件編號"]);
			this.csvRepeatObj = this.csvData.reduce((obj, curr, index ) => {
				const firstIndex = csvCSNArr.indexOf(curr["來源編號"]);
				if(moment(curr["查報日期"]).isSame(moment(this.searchDate)) && curr["來源編號"].length != 0 && csvCSNArr.indexOf(curr["來源編號"]) != index) {
					if(obj[curr["來源編號"]] == undefined) obj[curr["來源編號"]] = [ this.csvData[firstIndex]["案件編號"] ];
					obj[curr["來源編號"]].push(curr["案件編號"]);
				}
				return obj;
			}, {});
			this.caseMinus.list = listCSNArr.filter(l => csvCSNArr.indexOf(l) == -1);
			this.caseMinus.csv = csvCSNArr.filter(l => listCSNArr.indexOf(l) == -1);

			if(this.caseMinus.list.length == this.list.length) {
				this.$message({
					type: "warning",
					message: "日期不符，請重新上傳正確csv"
				});
				this.handleRemove();
			} else {
				let csvRepeat = Array.from({length: this.csvData.length}, () => false);
				this.list.forEach(l => {
					l.CaseType = l.BTName;

					this.csvData.forEach((data, index) => {
						if(csvRepeat[index]) return;
						else if(!moment(data["查報日期"]).isSame(moment(l.CaseDate))) {
							const outOfDateIndex = this.caseMinus.csv.indexOf(data["來源編號"]) != -1 ? this.caseMinus.csv.indexOf(data["來源編號"]) : this.caseMinus.csv.indexOf(data["案件編號"]);
							if(outOfDateIndex != -1) this.caseMinus.csv.splice(outOfDateIndex, 1);
							csvRepeat[index] = true;
						// } else if(( data["案件編號"] == l.CaseNo || data["來源編號"] == l.CaseNo) && !Object.keys(this.csvRepeatObj).includes(data["來源編號"])) {
						} else if((data["案件編號"] == l.CaseNo || data["來源編號"] == l.CaseNo) && (l.UploadCaseNo == undefined || l.UploadCaseNo.length == 0)) {
							if(data["案件編號"] == l.CaseNo && (data["來源編號"].length == 0 || data["來源編號"] == l.CaseNo)) {
								const otherSrcIndex = this.caseMinus.list.indexOf(data["案件編號"]);
								if(otherSrcIndex != -1) this.caseMinus.list.splice(otherSrcIndex, 1);
							}
							l.UploadCaseNo = data["案件編號"];
							l.CaseName = data["查報地點"];
							l.CaseType = data["損壞情況"];

							csvRepeat[index] = true;
						}
					})
				})
				this.loading = false;
			}
		},
		handleRemove(file, fileList) {
			this.csvData = [];
			if(fileList == undefined) this.csvFileList = [];
			else this.csvFileList = JSON.parse(JSON.stringify(fileList));
			this.$refs.uploadFile.clearFiles();
			this.getList();
		},
		handleDownload() {
			let tHeader = Object.values(this.headers);
			let filterVal = Object.keys(this.headers);
			// tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
			// filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
			let data = this.formatJson(filterVal, this.list);

			import("@/vendor/Export2Excel").then((excel) => {
				excel.export_json_to_excel({
					header: tHeader,
					data,
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
.PI-case-upload
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
		.upload-csv
			display: inline-flex
			flex-direction: row-reverse
			border: 1px solid rgba(#909399, 0.6)
			border-radius: 5px
			&.is-ready > .el-upload.el-upload--text
				display: none
			.el-upload-list__item
				transition: none !important
				margin-top: 0
				.el-upload-list__item-name
					line-height: 35px
					margin: 0 25px 0 10px
				.el-icon-close
					display: block
					top: 50%
					transform: translateY(-50%)
					color: #F56C6C
					font-weight: bold
					&:hover
						color: white
						background-color: #F56C6C
						border-radius: 50%
	.listLabel
		width: 100%
		.el-collapse-item__header
			background-color: #F2F6FC
			padding: 10px
			margin-bottom: 5px
			font-size: 16px
			&.is-active
				transition: 0.5s
				background-color: rgba(#F2F6FC, 0.5)
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
	.el-table .cell
		white-space: pre-line
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