<template>
	<div class="app-container finish-register" v-loading="loading">
		<h2>完工登錄</h2>
		<div class="filter-container">
			<div class="filter-item">
				<!-- TODO: 設施未完成 -->
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>類型</span>
					</div>
					<el-select v-model.number="listQuery.deviceType" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.deviceType" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>

			<!-- <span class="filter-item">
				<div style="font-size: 12px; color: #909399">派工日期</div>
				<time-picker shortcutType="day" :timeTabId.sync="timeTabId" :daterange.sync="daterange" @search="getList"/>
			</span> -->
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>廠商</span>
					</div>
					<el-select v-model.number="listQuery.contractor" placeholder="請選擇" popper-class="type-select" style="width: 100px">
						<el-option v-for="(name, id) in options.guildMap" :key="id" :value="Number(id)" :label="name" />
					</el-select>
				</div>
			</div>
			<br>

			<div class="filter-item">
				<el-input v-model="listQuery.filterStr" placeholder="請輸入" style="width: 300px" >
					<span slot="prepend">派工單號</span>
				</el-input>
			</div>
			
			<!-- <div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model="listQuery.tenderId" class="tender-select" placeholder="請選擇" popper-class="type-select tender">
						<el-option v-for="(name, id) in options.tenderMap" :key="id" :value="id" :label="name" />
					</el-select>
				</div>
			</div> -->

			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList();">搜尋</el-button>
			<!-- <el-button class="filter-item" type="info" icon="el-icon-document" :circle="screenWidth < 567" @click="handleDownload">輸出列表</el-button> --> 
		</div>

		<!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->
		<div v-if="list.length != 0" style="width: 240px; margin: 5px 5px 15px 10px;">
			<el-row v-if="list[0].DateClose.length != 0" :gutter="5">
				<el-col :span="12">完工登錄日期: </el-col>
				<el-col :span="12">{{ list[0].DateClose }}</el-col>
			</el-row>
			<el-row :gutter="5">
				<el-col :span="8">總面積: </el-col>
				<el-col :span="4">{{ Math.round(caseSum.areaSUM*10)/10 }}</el-col>
				<el-col :span="8">總噸數: </el-col>
				<el-col :span="4">{{ Math.round(caseSum.tonneSUM*10)/10 }}</el-col>
			</el-row>
		</div>

		<el-table
			ref="planTable"
			empty-text="目前沒有資料"
			:data="list"
			:key="deviceTypeNow"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
		>
			<el-table-column label="順序" prop="OrderIndex" width="50" align="center" fixed />
			<el-table-column v-if="!isAllCompleted" label="退回" width="60" align="center" fixed>
				<template slot-scope="{ row }">
					<el-button v-if="!row.edit" type="danger" size="mini" style="padding: 5px" @click="removeDispatch(row)">退回</el-button>
				</template>
			</el-table-column>

			<!-- <el-table-column prop="OrderSN" label="派工單號" width="125" align="center" fixed sortable /> -->
			<el-table-column prop="CaseNo" label="案件編號" width="130" align="center" fixed sortable>
				<template slot-scope="{ row }">
					<span>{{ row.CaseSN }}</span>
					<br>
					<span>{{ row.CaseNo }}</span>
					<br>
					<span style="color: #909399; font-size: 12px">{{ row.DName }} ({{ row.casetype }})</span>
				</template>
			</el-table-column>

			<el-table-column
				v-for="(value, key) in headers"
				:key="key"
				:prop="key"
				:label="value.name"
				align="center"
				:width="['SCType1Flag'].includes(key) ? 50 : null"
				:min-width="['Place'].includes(key) ? 80 : null"
				:sortable="value.sortable"
			>
				<template slot-scope="{ row, column }">
					<span v-if="[ 'SCType1Flag' ].includes(column.property)">
						<span v-if="row[column.property] == '3'">已完工</span>
						<span v-else-if="row[column.property] == '2'">已派工</span>
						<el-checkbox v-else v-model="row[column.property]" :true-label="1" :false-label="0" />
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>

			<!-- 道路、熱再生 -->
			<el-table-column v-if="[1,2].includes(deviceTypeNow)" label="算式" width="400" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.edit">
						<el-row v-if="row.editFormula" :gutter="5" type="flex" align="middle">
							<el-col :span="4"><el-tag class="btn-tag" type="success" @click="row.editFormula = false; calArea(row);">自訂</el-tag></el-col>
							<el-col :span="20"><el-input v-model="row.MillingFormula" @change="calArea(row)" /></el-col>
						</el-row>
						<el-row v-else :gutter="5" type="flex" align="middle">
							<el-col :span="4"><el-tag class="btn-tag" @click="row.editFormula = true; calArea(row);">簡單</el-tag></el-col>
							<el-col :span="8"><el-input v-model="row.MillingLength" @change="calArea(row)" /></el-col>
							<el-col :span="2" style="line-height: 36px"> ✕ </el-col>
							<el-col :span="8"><el-input v-model="row.MillingWidth" @change="calArea(row)" /></el-col>
						</el-row>
					</span>
					<span v-else>
						<span v-if="row.MillingFormula != '0'">{{ row.MillingFormula }}</span>
						<span v-else>{{ row.MillingLength }} * {{ row.MillingWidth }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column v-if="[1,2].includes(deviceTypeNow)" label="面積" width="80" align="center">
				<template slot-scope="{ row }">
					<!-- <el-input v-model="row.MillingArea" /> -->
					<span>{{ row.MillingArea || "-" }}</span>
				</template>
			</el-table-column>

			<!-- 道路 -->
			<el-table-column v-if="deviceTypeNow == '1'" label="完工備註" width="230" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.edit">
						<el-row v-for="key in options.workmemoOrder.filter(key => key != 'uNotes')" :gutter="5" :key="key">
							<el-col :span="6" style="line-height: 32px">{{ options.workmemo[key] }}</el-col>
							<el-col :span="16">
								<el-input v-model.number="row[key]" size="mini">
									<el-button slot="append" style="padding: 5px 10px" @click="imgUploadKey = key; rowActive = row; showImgUploadDialog = true">上傳圖片 ({{ row[`${key}Img`].length }})</el-button>
								</el-input>
							</el-col>
						</el-row>
						<el-row :gutter="5">
							<el-col :span="6" style="line-height: 32px">{{ options.workmemo.uNotes }}</el-col>
							<el-col :span="18">
								<el-input v-model="row.uNotes" size="mini" />
							</el-col>
						</el-row>
					</span>
					<el-row :gutter="5" v-else>
						<span v-if="options.workmemoOrder.filter(key => key != 'uNotes' && row[key] != 0).length != 0">
							<el-row :gutter="5">
								<span v-for="key in options.workmemoOrder.filter(key => key != 'uNotes' && row[key] != 0)" :key="key">
									<el-col :span="6">{{ options.workmemo[key] }}</el-col>
									<el-col :span="6" class="item-content">{{ row[key] }} (
										<span v-if="row[`${key}Img`].length > 0">
											<el-popover v-if="row[`${key}Img`].length > 0" popper-class="imgHover" placement="top" trigger="hover">
												<div v-for="(imgSpec, index) of row[`${key}Img`]" :key="`img_${index}`">
													<el-image style="max-width: 200px" :src="imgSpec.url" fit="scale-down" />
												</div>
												<span slot="reference">
													<i  class="el-icon-picture" style="color: #409EFF" />{{ row[`${key}Img`].length }}
												</span>
											</el-popover>
										</span>
										<span v-else><i class="el-icon-picture" style="color: #F56C6C" />{{ row[`${key}Img`].length }}</span>)
									</el-col>
								</span>
							</el-row>
							<el-row v-if="row.uNotes && row.uNotes.length != 0" :gutter="5">
								<el-col :span="6">{{ options.workmemo.uNotes }}</el-col>
								<el-col :span="18" class="item-content">{{ row.uNotes }}</el-col>
							</el-row>
						</span>
						<span v-else> - </span>
					</el-row>
				</template>
			</el-table-column>
			<el-table-column v-if="deviceTypeNow == '1'" label="刨鋪深度" width="80" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.edit">
						<el-select v-model="row.MillingDepth" size="mini" popper-class="type-select">
							<el-option v-for="value in options.depthArr" :key="value" :label="value" :value="value"/>
						</el-select>
					</span>
					<span v-else>{{ row.MillingDepth }}</span>
				</template>
			</el-table-column>
			<el-table-column v-if="deviceTypeNow == '1'" label="使用粒料" width="240" align="center">
				<template slot-scope="{ row }">
					<span v-if="row.edit">
						<el-row :gutter="5">
							<el-col :span="6" style="line-height: 28px">粒料3/4</el-col>
							<el-col :span="6">
								<el-select v-model="row.Aggregate34" size="mini" popper-class="type-select">
									<el-option v-for="value in options.depthArr" :key="value" :label="value" :value="value"/>
								</el-select>
							</el-col>
							<el-col :span="6" style="line-height: 28px">粒料3/8</el-col>
							<el-col :span="6">
								<el-select v-model="row.Aggregate38" size="mini" popper-class="type-select">
									<el-option v-for="value in options.depthArr" :key="value" :label="value" :value="value"/>
								</el-select>
							</el-col>
						</el-row>
						<hr>
						<el-checkbox v-model="row.SamplingL1" :true-label="1" :false-label="0">一級抽料</el-checkbox>
						<el-row :gutter="5">
							<el-col :span="8">
								<el-select v-model="row.SamplingL1Detail.Aggregate" size="mini" popper-class="type-select" :disabled="row.SamplingL1 == 0">
									<el-option v-for="(value, type) in options.sampling.typeMap" :key="type" :label="value" :value="type"/>
								</el-select>
							</el-col>
							<el-col :span="8">
								<el-input v-model="row.SamplingL1Detail.Amount" size="mini" :disabled="row.SamplingL1 == 0" />
							</el-col>
							<el-col :span="8">
								<el-select v-model="row.SamplingL1Detail.Unit" size="mini" popper-class="type-select" :disabled="row.SamplingL1 == 0">
									<el-option v-for="value in options.sampling.unitArr" :key="value" :label="value" :value="value"/>
								</el-select>
							</el-col>
						</el-row>
						<el-checkbox v-model="row.SamplingL2" :true-label="1" :false-label="0">二級抽料</el-checkbox>
						<el-row :gutter="5">
							<el-col :span="8">
								<el-select v-model="row.SamplingL2Detail.Aggregate" size="mini" popper-class="type-select" :disabled="row.SamplingL2 == 0">
									<el-option v-for="(value, type) in options.sampling.typeMap" :key="type" :label="value" :value="type"/>
								</el-select>
							</el-col>
							<el-col :span="8">
								<el-input v-model="row.SamplingL2Detail.Amount" size="mini" :disabled="row.SamplingL2 == 0" />
							</el-col>
							<el-col :span="8">
								<el-select v-model="row.SamplingL2Detail.Unit" size="mini" popper-class="type-select" :disabled="row.SamplingL2 == 0">
									<el-option v-for="value in options.sampling.unitArr" :key="value" :label="value" :value="value"/>
								</el-select>
							</el-col>
						</el-row>
					</span>
					<span v-else>
						<el-row :gutter="5">
							<el-col :span="8">粒料3/4: </el-col>
							<el-col :span="3" class="item-content">{{ row.Aggregate34 }}</el-col>
							<el-col :span="2" class="item-content"> | </el-col>
							<el-col :span="8">粒料3/8: </el-col>
							<el-col :span="3" class="item-content">{{ row.Aggregate38 }}</el-col>
						</el-row>

						<hr v-if="row.SamplingL1 || row.SamplingL2">

						<el-row :gutter="5" v-if="row.SamplingL1">
							<el-col :span="8" :offset="2">一級抽料: </el-col>
							<el-col :span="6">{{ options.sampling.typeMap[row.SamplingL1Detail.Aggregate] }}</el-col>
							<el-col :span="6"><span class="item-content">{{ row.SamplingL1Detail.Amount }}</span> {{ row.SamplingL1Detail.Unit }}</el-col>
						</el-row>

						<el-row :gutter="5" v-if="row.SamplingL2">
							<el-col :span="8" :offset="2">二級抽料: </el-col>
							<el-col :span="6">{{ options.sampling.typeMap[row.SamplingL2Detail.Aggregate] }}</el-col>
							<el-col :span="6"><span class="item-content">{{ row.SamplingL2Detail.Amount }}</span> {{ row.SamplingL2Detail.Unit }}</el-col>
						</el-row>
					</span>
				</template>
			</el-table-column>

			<!-- 設施 -->
			<el-table-column v-if="deviceTypeNow == 3" label="急件" width="55" align="center">
				<template slot-scope="{ row }">
					<el-checkbox v-model="row.IsPressing" />
				</template>
			</el-table-column>
			<el-table-column v-if="deviceTypeNow == 3" label="工程概述" align="center">
				<template slot-scope="{ row }">
					<el-input v-model="row.Notes" />
				</template>
			</el-table-column>
			
			<el-table-column label="動作" align="center">
				<template slot-scope="{ row }">
					<el-button-group v-if="!row.edit">
						<el-button v-if="!isAllCompleted" type="primary" size="mini" @click="row.edit = true">編輯</el-button>
						<el-button v-if="deviceTypeNow == 3" size="mini" @click="toggleExpand(row)">詳情</el-button>
						<el-button v-if="deviceTypeNow == 3" type="success" size="mini" @click="beforeEdit(row)">設計</el-button>
						<el-button type="info" size="mini" @click="showDetail(row)">檢視</el-button>
					</el-button-group>
					<el-button-group v-else>
						<el-button type="primary" size="mini" @click="finishRegisterSpec(row)">確定</el-button>
						<el-button size="mini" @click="row.edit = false; getList();">取消</el-button>
					</el-button-group>
				</template>
			</el-table-column>

			<el-table-column type="expand" width="1" align="center">
				<template slot-scope="props">
				</template>
			</el-table-column>
		</el-table>
		<br>
		
		<el-button class="btn-previewPdf" :type="isAllCompleted ? 'danger' : 'success'" icon="el-icon-s-claim" :disabled="list.length == 0 || isAllCompleted" @click="finishRegister()">
			{{ isAllCompleted ? "已登錄" : "完工登錄" }}
		</el-button>

		<!-- <pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" /> -->

		<!-- Dialog: 圖片上傳 -->
		<el-dialog width="520px" :title="`圖片上傳(${options.workmemo[imgUploadKey]})`" :visible.sync="showImgUploadDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-upload ref="uploadFile" :key="`${imgUploadKey}Img`" action="http://127.0.0.1:3001/google/upload" :auto-upload="false" list-type="picture-card" :file-list="rowActive[`${imgUploadKey}Img`]" :on-change="handleChange" :on-preview="handlePreview">
				<i class="el-icon-plus" />
				<!-- <el-button slot="trigger" type="info">選取</el-button> -->
				<div slot="tip" class="el-upload__tip">只能上傳jpg/png文件，且不超過500kb</div>
			</el-upload>
			<div slot="footer" class="dialog-footer">
				<el-button @click="showImgUploadDialog = false; getList();">取消</el-button>
				<el-button type="primary" @click="submitUpload()">上傳</el-button>
			</div>
		</el-dialog>

		<el-image-viewer
			v-if="showImgViewer"
			class="upload-preview"
			:on-close="() => { showImgViewer = false; }"
			:url-list="imgPreviewUrls"
			:initial-index="imgPreviewIndex"
		/>

		<!-- Dialog: 案件檢視 -->
		<el-dialog width="500px" title="案件檢視" :visible.sync="showDetailDialog">
			<case-detail ref="caseDetail" :loading.sync="loading" :showDetailDialog.sync="showDetailDialog" :deviceTypeNow="deviceTypeNow" />
			<div slot="footer" class="dialog-footer">
				<!-- <el-button @click="showDispatch = false">取消</el-button> -->
				<el-button type="primary" @click="showDetailDialog = false">確定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import { getTenderMap, getGuildMap } from "@/api/type";
import { getFinRegister, finRegisterSpec, finRegister, revokeDispatch } from "@/api/dispatch";
// import TimePicker from "@/components/TimePicker";
import CaseDetail from "@/components/CaseDetail";
// import Pagination from "@/components/Pagination";

export default {
	name: "finRegister",
	components: { ElImageViewer, CaseDetail },
	data() {
		return {
			loading: false,
			showImgViewer: false,
			showImgUploadDialog: false,
			showDetailDialog: true,
			screenWidth: window.innerWidth,
			searchRange: "",
			isAllCompleted: false,
			deviceTypeNow: 1,
			orderSNNow: 0,
			imgUploadKey: "",
			listQuery: {
				filterType: 2,
				filterStr: null,
				tenderId: null,
				deviceType: 1,
				contractor: null,
				// pageCurrent: 1,
				// pageSize: 50,
			},
			headers: {
				// CaseSN: {
				// 	name: "申請單號",
				// 	sortable: true,
				// },
				// CaseNo: {
				// 	name: "案件編號",
				// 	sortable: true,
				// },
				// casetype: {
				// 	name: "查報來源",
				// 	sortable: false,
				// },
				// DName: {
				// 	name: "案件類型",
				// 	sortable: false,
				// },
				Place: {
					name: "案件地點",
					sortable: false
				},
				SCType1Flag: {
					name: "補繪標線",
					sortable: false
				}
			},
			imgPreviewUrls: [],
			imgPreviewIndex: 0,
			// total: 0,
			list: [],
			// detail: [],
			rowActive: {},
			checkIndeterminate: false,
			checkList: [],
			list: [],
			tableSelectSum: { areaSUM: 0, tonneSUM: 0 },
			apiHeader: [ "SerialNo", "MillingLength", "MillingWidth", "MillingDepth", "MillingFormula", "MillingArea", "uStacker", "uSprinkler", "uDigger", "uRoller", "uPaver", "uNotes", "Aggregate34", "Aggregate38", "SamplingL1", "SamplingL1Detail", "SamplingL2", "SamplingL2Detail" ],
			options: {
				tenderMap: {},
				guildMap: {},
				deviceType: {
					1: "道路",
					2: "熱再生",
					3: "設施",
					4: "標線"
				},
				workmemo: {
					"uStacker": "堆高機",
					"uDigger": "挖土機",
					"uPaver": "鋪裝機",
					"uRoller": "壓路機",
					"uSprinkler": "灑水車",
					"uNotes": "備註"
				},
				workmemoOrder: [ "uStacker", "uDigger", "uPaver", "uRoller", "uSprinkler", "uNotes" ],
				depthArr: [0, 5, 10],
				sampling: {
					typeMap: {
						34: "3/4",
						38: "3/8"
					},
					unitArr: ["噸", "m3"]
				}
			}
		};
	},
	computed: { 
		caseSum() {
			return this.list.reduce((acc, cur) => {
				acc.areaSUM += cur.MillingArea;
				acc.tonneSUM += Math.round(cur.MillingArea*cur.MillingDepth*0.01*2.25*10) / 10;
				return acc;
			}, { areaSUM: 0, tonneSUM: 0 });
		}
	},
	watch: { },
	created() { 
		getTenderMap().then(response => { this.options.tenderMap = response.data.tenderMap });
		getGuildMap().then(response => { this.options.guildMap = response.data.guildMap });
	},
	mounted() {
		this.showDetailDialog = false;
		if (this.$route.query.orderSN && this.$route.query.contractor) {
			this.listQuery.filterStr = this.$route.query.orderSN;
			this.listQuery.contractor = this.$route.query.contractor;
			this.getList();
		} 
	},
	methods: {
		cellCheckBox(row, index) {
			if(this.checkList[index]) this.$refs.planTable.toggleRowSelection(row, true);
			else this.$refs.planTable.toggleRowSelection(row, false);
		},
		toggleExpand(row) {
			this.$refs.planTable.toggleRowExpansion(row)
		},
		getList() {
			if (!Number(this.listQuery.contractor)) {
				this.$message({
					message: "請選擇廠商",
					type: "error",
				});
			} else if (!Number(this.listQuery.filterStr)) {
				this.$message({
					message: "請輸入正確派工單號",
					type: "error",
				});
			} else {
				this.loading = true;
				this.isAllCompleted = false;
				this.list = [];

				// let startDate = moment(this.daterange[0]).format("YYYY-MM-DD");
				// let endDate = moment(this.daterange[1]).format("YYYY-MM-DD");
				// this.searchRange = startDate + " - " + endDate;

				getFinRegister({
					contractor: this.listQuery.contractor,
					dispatchSN: this.listQuery.filterStr,
					deviceType: this.listQuery.deviceType,
					// timeStart: startDate,
					// timeEnd: moment(endDate).add(1, "d").format("YYYY-MM-DD")
				}).then(response => {
					if (response.data.list.length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
						this.total = 0;
					} else {
						this.list = response.data.list;
						this.isAllCompleted = this.list[0].IsAllCompleted == 1;
						this.checkList = Array.from({ length: this.list.length }, () => false);
						this.deviceTypeNow = this.listQuery.deviceType;
						this.orderSNNow = this.listQuery.filterStr;

						this.list.forEach(l => {
							l.DateClose = this.formatTime(l.DateClose);
							this.$set(l, "editFormula", l.MillingFormula != '0');

							this.$set(l, "uStackerImg", [ { name: '20220926-3.jpg', url: '/assets/testPic/244/1110835872/20220926-3.jpg' }, { name: '20220926-1.jpg', url: '/assets/testPic/244/1110835872/20220926-1.jpg' }]);
							this.$set(l, "uDiggerImg",  [ { name: '20220926-1.jpg', url: '/assets/testPic/244/1110835872/20220926-1.jpg' }]);
							this.$set(l, "uPaverImg", []);
							this.$set(l, "uRollerImg", []);
							this.$set(l, "uSprinklerImg", []);

							l.SamplingL1Detail = l.SamplingL1Detail.length == 0 
								? Object.assign({}, { "Aggregate": "", "Amount": 0, "Unit": "" })
								: JSON.parse(l.SamplingL1Detail);

							l.SamplingL2Detail = l.SamplingL2Detail.length == 0 
								? Object.assign({}, { "Aggregate": "", "Amount": 0, "Unit": "" })
								: JSON.parse(l.SamplingL2Detail);

							this.$set(l, "edit", false);
						})
					}
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		showDetail(row) {
			this.loading = true;
			this.$refs.caseDetail.getDetail(row);
		},
		calArea(row) {
			const replaceObj = { " ": "", "＋": "+", "－": "-", "＊": "*", "x": "*", "X": "*", "×": "*", "／": "/", "（": "(", "）": ")",
			"０": '0', "１": "1", "２": "2", "３": "3", "４": "4", "５": "5", "６": "6", "７": "7", "８": "8", "９": "9" };
			
			if(row.editFormula) {
				for(const key in replaceObj) row.MillingFormula = row.MillingFormula.replaceAll(key, replaceObj[key]);
				row.MillingArea = Math.round(new Function(`return ${row.MillingFormula}`)() * 100) / 100;
			} else row.MillingArea = row.MillingLength * row.MillingWidth;
		},
		formatTime(time) {
			return time ? moment(time).format("YYYY-MM-DD") : "";
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
		submitUpload() {
			this.$refs.uploadFile.submit();
		},
		handleChange(file, fileList) {
			// console.log(fileList);
			this.rowActive[`${this.imgUploadKey}Img`] = fileList;
			this.imgPreviewUrls = fileList.map(file => file.url);
		},
		handlePreview(file) {
			// console.log(file);
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		finishRegisterSpec(row) {
			this.$confirm(`確認 案件編號${row.CaseNo} 資料登錄?`, "確認", { showClose: false })
				.then(() => {
					row.edit = false;
					this.calArea(row);

					let rowActive = JSON.parse(JSON.stringify(this.caseFilterList([row])[0]));
					if(row.editFormula) {
						delete rowActive.MillingLength;
						delete rowActive.MillingWidth;
					} else delete rowActive.MillingFormula;

					if(rowActive.SamplingL1 == 1) rowActive.SamplingL1Detail = JSON.stringify(rowActive.SamplingL1Detail);
					else delete rowActive.SamplingL1Detail;

					if(rowActive.SamplingL2 == 1) rowActive.SamplingL2Detail = JSON.stringify(rowActive.SamplingL2Detail);
					else delete rowActive.SamplingL2Detail;

					console.log(rowActive);

					finRegisterSpec({
						deviceType: this.deviceTypeNow,
						caseSpec: rowActive
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "登錄成功",
								type: "success",
							});
						} else {
							this.$message({
								message: "登錄失敗",
								type: "error",
							});
						}
						this.getList();
					}).catch(err => {
						console.log(err);
						this.getList();
					});
				}).catch(err => {});
		},
		finishRegister() {
			this.$confirm(`確認將 派工單號${this.orderSNNow} 完工登錄?`, "確認", { showClose: false })
				.then(() => {
					this.list.forEach(row => this.calArea(row));
					let caseList = JSON.parse(JSON.stringify(this.caseFilterList(this.list)));
					caseList.forEach(row => {
						if(row.editFormula) {
							delete row.MillingLength;
							delete row.MillingWidth;
						} else delete row.MillingFormula;

						if(row.SamplingL1 == 1) row.SamplingL1Detail = JSON.stringify(row.SamplingL1Detail);
						else delete row.SamplingL1Detail;

						if(row.SamplingL2 == 1) row.SamplingL2Detail = JSON.stringify(row.SamplingL2Detail);
						else delete row.SamplingL2Detail;
					});

					finRegister({
						deviceType: this.deviceTypeNow,
						orderSN: Number(this.orderSNNow),
						caseList: caseList
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "登錄成功",
								type: "success",
							});
						} else {
							this.$message({
								message: "登錄失敗",
								type: "error",
							});
						}
						this.getList();
					}).catch(err => {
						console.log(err);
						this.getList();
					});
				}).catch(err => {});
		},
		removeDispatch(row) {
			this.$confirm(`確認退回 案件編號${row.CaseNo} 的派工?`, "確認", { showClose: false })
				.then(() => {
					revokeDispatch({
						deviceType: this.deviceTypeNow,
						serialNo: row.SerialNo
					}).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "退回成功",
								type: "success",
							});
						} else {
							this.$message({
								message: "退回失敗",
								type: "error",
							});
						}
						this.getList();
					}).catch(err => {
						console.log(err);
						this.getList();
					});
				}).catch(err => {});
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.finish-register
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select
				width: 110px
				.el-input__inner
					padding-left: 3px
					padding-right: 10px
					text-align: center
				.el-input__suffix
					right: 0
					// margin-right: -5px
					transform: scale(0.7)
				&.tender-select
					width: 520px
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
					padding-left: 10px
					text-align: left
	.btn-previewPdf
		position: relative
		left: 50%
		transform: translateX(-50%)
	.el-table
		.input-length, .input-width
			max-width: 60px
		.btn-tag
			cursor: pointer
		.el-table__expand-icon
			display: none
		.item-content
			color: #C0C4CC
		.el-select
			// width: 85px
			.el-input__inner
				padding-left: 8px
				padding-right: 10px
			.el-input__suffix
				right: 0
				margin-right: -3px
				transform: scale(0.7)
		.el-checkbox
			margin-right: 0
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
	.btn-dialog
		padding: 5px 5px
	.upload-preview
		width: 100%
		z-index: 3000 !important
		.el-icon-circle-close
			color: white
</style>