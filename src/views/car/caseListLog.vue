<template>
	<div class="app-container inspection-progress" v-loading="loading">
		<h2>巡視歷程</h2>
		<!-- 搜尋 -->
		<div class="filter-container">
			<el-select v-model="listQuery.ContractId" placeholder="請選擇" style="width: 110px;">
        <el-option label="全部" :value="99" />
          <el-option v-for="(text, id) in team" :key="`ContractId${id}`" :label="text" :value="Number(id)" />
        </el-select>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
			<el-button class="filter-item" type="success" @click="csvVisible = true">匯入csv</el-button>
		</div>

		<!-- 資料列表 -->
		<el-table ref="multipleTable" empty-text="目前沒有資料" :data="list" border fit :header-cell-style="{ 'background-color': '#F2F6FC' }" style="width: 100%">
			<el-table-column 
				v-for="(value, key) in headers" 
				:key="key" :prop="key" 
				:label="value.name" 
				align="center" 
				:sortable="value.sortable"
			>
			</el-table-column>
		</el-table>

    <el-dialog
			:visible.sync="csvVisible"
			width="700px">
			<div>
				<el-form ref="file" label-width="120px">
				<el-form-item label="導入csv">
					<el-upload
						class="upload-demo"
						ref="upload"
						drag
						accept=".csv"
						action=""
						:multiple="false"
						:limit="1"
						:auto-upload="false"
						:on-change="handleChange">
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">將文件拖到此處，或<em>點擊上傳csv</em></div>
						<!-- <div class="el-upload__tip" slot="tip">只能上傳csv</div> -->
					</el-upload>
				</el-form-item>
				</el-form>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="importCsv">匯入</el-button>
				<el-button @click="csvVisible = false">取消</el-button>
			</span>
    </el-dialog>

    
	</div>
</template>

<script>
import moment from "moment";
import { getCaseListLog, importCaseListLog } from "@/api/car";
import TimePicker from '@/components/TimePicker';
import commonMixin from '@/mixins/common';
import { parse } from 'csv-parse';
import { Trans97 } from 'trans97';

export default {
	mixins: [commonMixin],
	name: "caseListLog",
	components: { TimePicker },
	data() {
	return {
		loading: false,
		dialogMapVisible: true,
		csvVisible: false,
		file: null,
		timeTabId: 1,
		dateRange: [ moment().startOf("week").add(1, 'day').toDate(), moment().endOf("week").add(1, 'day').toDate() ],
		listQuery: {
			filterType: 1,
			ZipCode: 0,
      ContractId: 1,
		},
		area:{
			0: "全部",
			100: '中正區',
			103: '大同區',
			104: '中山區',
			105: '松山區',
			106: '大安區',
			108: '萬華區',
			110: '信義區',
			111: '士林區',
			112: '北投區',
			114: '內湖區',
			115: '南港區',
			116: '文山區',
			999: '橋涵區'
		},
    team: {
      1: '第一分隊',
      2: '第二分隊',
      3: '第三分隊',
      4: '第四分隊',
      5: '第五分隊',
      6: '第六分隊'
    },
		list:[],
		rowActive: {},
		headers: {
			CaseNo: {
        name: '案件編號',
        sortable: false,
      },
      DateReport: {
        name: '查報日期',
        sortable: false,
      },
      ContractId: {
        name: '標案ID',
        sortable: false,
      },
      ZipCode: {
        name: '區號',
        sortable: false,
      },
      ReportUser: {
        name: '登錄人員',
        sortable: false,
      },
      ReceiveUser: {
        name: '收件人員',
        sortable: false,
      },
      LocationReport: {
        name: '查報地點',
        sortable: false
      },
      DamageDesc: {
        name: '損壞情形',
        sortable: false,
      },
      DamageCondition: {
        name: '損壞狀況',
        sortable: false,
      },
      TemporaryFix: {
        name: '臨時修補',
        sortable: false,
      },
      CaseCondition: {
        name: '案件狀態',
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
	mounted() {},
	methods: {
		formatTime(time) {
			return time ? moment(time).format("YYYY/MM/DD") : "";
		},
		getList() {
      getCaseListLog({ ContractId: this.listQuery.ContractId }).then(response => {
        if (response.data.list.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
          this.loading = false;
        } else {
          this.list = response.data.list;
          this.list.map(item => {
            item.DateReport = this.formatTime(item.DateReport),
            item.EstimatedDate = this.formatTime(item.EstimatedDate),
            item.TemporaryFix = 0 ? '是' : '否', // 邏輯是反的 需實驗
            item.ZipCode = this.area[item.ZipCode],
            item.ContractId = this.team[item.ContractId]
          });
        }
      }).catch(err => { this.loading = false; });
			
		},
    handleChange(file) {
			this.file = file.raw;
		},
		async importCsv() {
			const reader = new FileReader();
			reader.onload = (event) => {
				const csvData = event.target.result;
				parse(csvData, {
					columns: true,
					trim: true
				}, (err, res) => {
					if (err) {
						console.error(err);
					} else {
						const caseNo = res.map((key) => key.案件編號);
						const dateReport = res.map((key) => key.查報日期);
						const zipAndTeam = res.map((key) => key.權責單位); // 分成zipCode區號 ContractId標案ID
						const reportUser = res.map((key) => key.登錄人員);
						const receiveUser = res.map((key) => key.收件人員);
						const locationReport = res.map((key) => key.查報地點);
						const estimatedDate = res.map((key) => key.預計完工日期);
						const sourceNo = res.map((key) => key.來源編號);
						const damageDesc = res.map((key) => key.損壞情形);
						const damageCondition = res.map((key) => key.損壞狀況);
						const areaFix = res.map((key) => key.修補面積);
						const temporaryFix = res.map((key) => key.臨時修復);
						const sourceReport = res.map((key) => key.查報來源);
						const caseCondition = res.map((key) => key.案件狀態);
						const twd97_x = res.map((key) => key.X座標);
						const twd97_y = res.map((key) => key.Y座標);

						const formatDateReport = []; // 查報日期
						const formatEstimatedDate = []; // 預計完工日期

						for (let i = 0; i < caseNo.length; i++) {
							formatDateReport.push(moment(dateReport[i]).add(1911, 'years').subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss'));
							formatEstimatedDate.push(moment(estimatedDate[i]).add(1911, 'years').subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss'));
						}
						// 權責單位 區域轉數字
						const zipCode = zipAndTeam.map(item => {
							for (const [code, name] of Object.entries(this.area)) {
								if (item.includes(name)) return code;
							}
						});
						// 權責單位 分隊轉數字
						const contractId = zipAndTeam.map(item => {
							for (const [code, name] of Object.entries(this.team)) {
								if (item.includes(name)) return code;
							}
						})

						const trans97 = new Trans97({
							type: 'wgs84'
						});
						
						const positionArr = [];
						for (let i = 0; i < twd97_x.length; i++) {
							const position = trans97.getLocation(parseFloat(twd97_x[i]), parseFloat(twd97_y[i]));
							positionArr.push(position);
						}
						
						const temporaryFixArr = [];
						for (let i = 0; i < caseNo.length; i++) {
							
							if (temporaryFix[i] == '是') temporaryFixArr.push(1);
							else temporaryFixArr.push(0);

							importCaseListLog({
								CaseNo: caseNo[i],
								DateReport: formatDateReport[i],
								ContractId: contractId[i],
								ZipCode: zipCode[i],
								ReportUser: reportUser[i],
								ReceiveUser: receiveUser[i],
								LocationReport: locationReport[i],
								EstimatedDate: formatEstimatedDate[i],
								SourceNo: sourceNo[i],
								DamageDesc: damageDesc[i],
								DamageCondition: damageCondition[i],
								AreaFix: areaFix[i],
								TemporaryFix: temporaryFixArr[i],
								SourceReport: sourceReport[i],
								CaseCondition: caseCondition[i],
								WGS84_x: positionArr[i].lat,
								WGS84_y: positionArr[i].lng
							}).then(response => {
								this.$message({
									showClose: true,
									message: '成功匯入',
									type: 'success'
								});
							}).catch(err => console.log(err));
						}
						this.csvVisible = false;
					}
				});
			};
			reader.readAsText(this.file);
		}
	}
};
</script>

<style lang="sass">
.inspection-progress
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
