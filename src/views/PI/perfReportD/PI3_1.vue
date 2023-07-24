<template>
	<div class="app-container PI3_1" v-loading="loading">
		<h2>PI3.1</h2>
			<el-button-group>
			<el-button icon="el-icon-arrow-left" size="mini" plain :disabled="pageTurn[0] == -1" @click="handlePageTurn(-1)">上一頁</el-button>
			<el-button type="primary" size="mini" plain :disabled="pageTurn[1] == -1"  @click="handlePageTurn(1)">下一頁<i class="el-icon-arrow-right el-icon--right" /></el-button>
		</el-button-group>
		<el-button type="info" size="mini" style="margin-left: 5px" @click="handlePageTurn(0)">返回</el-button>

		<el-row :gutter="24">
			<el-col :span="11">
				<el-card shadow="never" style="width: 450px; margin: 40px auto; padding: 5px 10px; ">
					<el-form :model="inputForm" >
						<div style="display:flex;justify-content:space-between;align-items: center">
							<h2>檢核資訊</h2>
							<el-button
								class="filter-item"
								type="success"
								icon="el-icon-document"
								@click="storeData"
								style="height:40px"
							>儲存</el-button>
						</div>
						<el-divider />
						<el-form-item label="起始頁碼" :label-width="labelWidth1">
							<el-input-number v-model="initPage"  :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="檢查日期" :label-width="labelWidth1">
							<el-date-picker
								v-model="searchDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<el-form-item label="行政區" :label-width="labelWidth1">
							<el-select class="filter-item" v-model="inputs.zipCode" :disabled="Object.keys(districtList).length <= 1" @change="setPDFinputs()" style="width: 200px">
								<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="zip" />
							</el-select>
						</el-form-item>
						<el-divider />
						<el-form-item label="當日工作執行日報填寫人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.dailyReport_Num31" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<!-- <el-form-item label="滿足安全性巡查人數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.qualifiedSafety_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider /> -->
						<el-form-item label="未滿足基本安全要求人數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.unqualifiedSafety_Num31" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<!-- <el-divider />
						<el-form-item label="廠商自主檢查人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.companyCheck_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<h4>監造抽查人次數</h4>
						<el-form-item label="合格人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.supervisionCheckPass_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合格人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.supervisionCheckFail_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<h4>機關抽查人次數</h4>
						<el-form-item label="合格人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.organCheckPass_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="不合格人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.organCheckFail_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-divider />
						<el-form-item label="確定不合格總人次數" :label-width="labelWidth1">
							<el-input-number v-model="inputForm.totalUnqualified_Num" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item> -->
						<el-divider />
						<h4>應檢附文件</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.checkCo_dailyInspectAll31" @change="setPDFinputs" >廠商每日完成自主檢查資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCo_discoverUnSafety31" @change="setPDFinputs">廠商自主發現未滿足基本安全要求人次數資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkOr_discoverUnSafety31" @change="setPDFinputs">機關或監造於抽查檢核後發現為滿足基本安全要求人次數資訊</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.checkCo_unreasonable31" @change="setPDFinputs">廠商認為查檢核發現未滿足不合理資訊</el-checkbox>
						</el-form-item>
						<!-- <el-divider />
						<h4>是否合格</h4>
						<el-form-item label="" :label-width="labelWidth2">
							<el-checkbox v-model="inputForm.pass" @change="setPDFinputs">是</el-checkbox>
							<br/>
							<el-checkbox v-model="inputForm.fail" @change="setPDFinputs">否，原因:(請填寫原因)</el-checkbox>
							<br/>
							<el-input type="text" v-model="inputForm.failReson" @change="setPDFinputs" size="small" style="width:350px">
								<template slot="prepend">原因</template>
							</el-input>

						</el-form-item> -->
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="13" ref="container" class="container"/>
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { getPerfContent, setPerfContent } from "@/api/PI";

export default {
	name: "PI3_1",
	components: { },
	data() {
		return {
			labelWidth1:'170px',
			labelWidth2:'10px',
			loading: false,
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
			initPage:4,
			listQuery: {
				reportId: 0,
				perfContentId: null
			},
			searchDate: moment().startOf("d").subtract(1, "d"),
			list:[],
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
			pageTurn: [-1, -1],
			template: {},
			inputForm: {
				dailyReport_Num31: 0,
				qualifiedSafety_Num31: 0,
				unqualifiedSafety_Num31: 0,
				companyCheck_Num31:0,
				// supervisionCheckPass_Num: 0,
				// supervisionCheckFail_Num: 0,
				// organCheckPass_Num: 0,
				// organCheckFail_Num: 0,
				// totalUnqualified_Num: 0,
				BCA_31:0,
				// BCDA:0,
				// BCDEA:0,
				checkCo_dailyInspectAll31:true,
				checkCo_discoverUnSafety31:true,
				checkOr_discoverUnSafety31:true,
				checkCo_unreasonable31:true,
				// pass:false,
				// fail:false,
				// failReson: ''
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約',//工程名稱
				serialNumber_31: '1111102104',//紀錄編號
				companyName: '聖東營造股份有限公司',//施工廠商
				date: '',//檢查日期
				zipCode: '104',//行政區
				district: '中山區',
				requiredStandard_31:'廠商人員執行工作應滿足安全性要求',//要求標準
				measurement_31:'當天滿足要求人次數/當日工作執行日報填寫人數',//量測方式
				dailyReport_Num31: '0',//A
				qualifiedSafety_Num31: '0',//B
				unqualifiedSafety_Num31: '0',//C
				companyCheck_Num31:'0',
				// supervisionCheckPass_Num: '0 件',
				// supervisionCheckFail_Num: '0 件',//D
				// organCheckPass_Num: '0 件',
				// organCheckFail_Num: '0 件',//E
				// totalUnqualified_Num: '0 件',
				BCA_31:'',
				// BCDA:'',
				// BCDEA:'',
				checkCo_dailyInspectAll31:'',
				checkCo_discoverUnSafety31:'',
				checkOr_discoverUnSafety31:'',
				checkCo_unreasonable31:'',
				// pass:'',
				// fail:'',
				// failReson: '',
			},
		};
	},
	computed: { },
	watch: {},
	created() {	
		// this.template = {};
		// this.form = {};

		if(this.$route.query.contentId) {
			this.listQuery.reportId = this.$route.query.reportId;
			this.listQuery.perfContentId = this.$route.query.contentId;

			const cidList = this.$route.query.cidList.split(",");
			const pageIndex = cidList.indexOf(String(this.$route.query.contentId));
			this.pageTurn = [ 
				Number(pageIndex) == 0 ? -1 : cidList[pageIndex-1], 
				Number(pageIndex) == cidList.length - 1 ? -1 : cidList[pageIndex+1] 
			];

			getPerfContent({
				contentId: this.listQuery.perfContentId
			}).then((response) => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.list = response.data.list;
					if(this.list[0].content.length!=0){
						this.inputs = this.list[0].content.inputs
						this.inputForm = this.list[0].content.inputForm
						this.searchDate = this.list[0].checkDate
					}
					this.initPDF();
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		} else this.$router.push({ path: "/PIIndex/perfReportD/list" });
	},
	mounted() { },
	methods: {
		initPDF() {
			fetch(`/assets/pdf/PI3_1-Main.json?t=${Date.now()}`).then(async (response) => {
				const domContainer = this.$refs.container.$el;
				this.template = await response.json();

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					},
				};

				this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				this.form.onChangeInput(arg => {
					if(['checkCo_dailyInspectAll31','checkCo_discoverUnSafety31','checkOr_discoverUnSafety31','checkCo_unreasonable31'].includes(arg.key)){
						this.inputForm[arg.key] = (arg.value == 'V' || arg.value == 'v')
					}
					if(['dailyReport_Num31','qualifiedSafety_Num31','unqualifiedSafety_Num31','companyCheck_Num31'].includes(arg.key)) {
						this.inputForm[arg.key] = parseInt(arg.value)
					}
					this.setPDFinputs();
				});
				this.setPDFinputs();
			})
		},
		setPDFinputs() {
			//檢查日期
			const date = moment(this.searchDate).subtract(1911, 'year');
			this.inputs.date = date.format("YYYY年MM月DD日").slice(1);
			//工程名稱
			this.inputs.district = this.districtList[this.inputs.zipCode].name;
			this.inputs.contractName = date.year()+"年度"+this.inputs.district+"道路巡查維護修繕成效式契約";
			//紀錄編號
			this.inputs.serialNumber_31 = date.format("YYYYMMDD01").slice(1) + String(this.initPage).padStart(2, '0');			
			//查核人次數
			for(const key of [ 
				'dailyReport_Num31',
				'unqualifiedSafety_Num31']) {
				this.inputs[key] = String(this.inputForm[key]);
			}
			//計算當日工作執行日報填寫人次數(A) = 滿足安全性巡查人數(B) = 廠商自主檢查人次數
			this.inputs.qualifiedSafety_Num31 = String(this.inputForm.dailyReport_Num31);
			this.inputs.companyCheck_Num31 = String(this.inputForm.dailyReport_Num31);
			//計算指標數值
			const A = this.inputForm.dailyReport_Num31;
			const B = this.inputForm.qualifiedSafety_Num31 = this.inputForm.dailyReport_Num31;
			const C = this.inputForm.unqualifiedSafety_Num31;
			// const D = this.inputForm.supervisionCheckFail_Num;
			// const E = this.inputForm.organCheckFail_Num;
			if(A==0){
				this.inputs.BCA_31=''
			}else{
				this.inputs.BCA_31=String(((B-C)/A)*100)
				// this.inputs.BCDA=String(((B-C-D)/A)*100)
				// this.inputs.BCDEA=String(((B-C-D-E)/A)*100)
			}
			//應檢附文件
			for(const key of ['checkCo_dailyInspectAll31','checkCo_discoverUnSafety31','checkOr_discoverUnSafety31','checkCo_unreasonable31']){
				this.inputs[key] = this.inputForm[key] ? 'V' : '';
			}
			//否定原因填寫
			// this.inputs.failReson=this.inputForm.failReson
			
			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		storeData(){
			const storedContent = {
				pageCount:1,
				inputForm:this.inputForm,
				inputs:this.inputs
			}
			setPerfContent(this.perfContentId,{
				checkDate: moment(this.searchDate).format("YYYY-MM-DD"),
				content: JSON.stringify(storedContent)
			}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "提交成功",
						type: "success",
					});
				} 
			}).catch(err => {
				console.log(err);
			})
		},
		handleDownload() {
			// console.log(this.form);
			generate({ template: this.form.getTemplate(), inputs: this.form.getInputs(), options: { font: this.form.getFont() } }).then((pdf) => {
				// console.log(pdf);
				const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
				// window.open(URL.createObjectURL(blob));

				const filename = "成效式契約指標檢核表PI-3-1.pdf"; 
				const file = new File([blob], filename, { type: 'application/pdf' });
				const link = document.createElement('a');
				const url = URL.createObjectURL(file);
				link.href = url;
				link.download = file.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			});
		},
			handlePageTurn(type) {
			switch(type) {
				case 0:
					this.$router.push({
						path: "/PIIndex/perfReportD/edit",
						query: { reportId: this.listQuery.reportId }
					})
					return;
				case -1:
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1_Att_2",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[0], cidList: this.$route.query.cidList }
					})
					return;
				case 1:
					this.$router.push({
						path: "/PIIndex/perfReportD/PI3_1_Att",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
					})
					return;
			}
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.PI3_1
	position: relative
	.filter-container 
		.filter-item
			margin-right: 5px
	// .container
	// 	position: fixed
	// 	top:30px
	// 	right:0
	// 	z-index: index -100 
	
</style>