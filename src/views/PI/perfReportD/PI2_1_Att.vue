<template>
	<div class="app-container PI2_1-Att" v-loading="loading">
		<h2>PI2.1附件</h2>
		<el-button-group>
			<el-button icon="el-icon-arrow-left" size="mini" plain :disabled="pageTurn[0] == -1" @click="handlePageTurn(-1)">上一頁</el-button>
			<el-button type="primary" size="mini" plain :disabled="pageTurn[1] == -1"  @click="handlePageTurn(1)">下一頁<i class="el-icon-arrow-right el-icon--right" /></el-button>
		</el-button-group>
		<el-button type="info" size="mini" style="margin-left: 5px" @click="handlePageTurn(0)">返回</el-button>

		<el-row :gutter="24">
			<el-col :span="10">
				<el-card shadow="never" style="width: 400px; margin: 40px auto; padding: 5px 10px;">
					<el-form :model="inputForm" label-width="100px">
						<div style="display:flex;justify-content:space-between;align-items: center">
							<h2>通報資訊</h2>
							<el-button
								class="filter-item"
								type="success"
								icon="el-icon-document"
								@click="storeData"
								style="height:40px"
							>儲存</el-button>
						</div>
						
						<el-divider />
						<el-form-item label="起始頁碼">
							<el-input-number v-model="initPage" controls-position="right" :min="1" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="檢查日期" >
							<el-date-picker
								v-model="checkDate"
								type="date"
								placeholder="日期"
								:picker-options="pickerOptions"
								:clearable="false"
								style="width: 200px"
								@change="setPDFinputs"
							/>
						</el-form-item>
						<!-- <el-form-item label="行政區">
							<el-select class="filter-item" v-model="inputs.zipCode" :disabled="Object.keys(districtList).length <= 1" @change="getList()" style="width: 200px">
								<el-option v-for="(info, zip) in districtList" :key="zip" :label="info.name" :value="zip" />
							</el-select>
						</el-form-item> -->
						<!-- <el-form-item label="本日通報">
							<el-input-number v-model="inputForm.caseReportTotal" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item> -->
						<el-divider />

						<h3>系統登錄</h3>
						<h4>路面: </h4>
						<el-form-item label="觀察區">
							<el-input-number v-model="inputForm.ACTotal_Obs" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="正式區">
							<el-input-number v-model="inputForm.ACTotal_Reg" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>

						<h4>設施: </h4>
						<el-form-item label="觀察區">
							<el-input-number v-model="inputForm.facTotal_Obs" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
						<el-form-item label="正式區">
							<el-input-number v-model="inputForm.facTotal_Reg" controls-position="right" :min="0" @change="setPDFinputs" />
						</el-form-item>
					</el-form>
				</el-card>
			</el-col>
			<el-col :span="14" ref="container" />
		</el-row>
	</div>
</template>

<script>
import moment from "moment";
import { generate } from '@pdfme/generator';
import { Form } from '@pdfme/ui';
import { getCaseCount,getPerfContent, setPerfContent } from "@/api/PI";

export default {
	name: "PI2_1_Att",
	components: { },
	data() {
		return {
			loading: false,
			timeTabId: 1,
			initPage: 2,
			listQuery: {
				reportId: 0,
				perfContentId: null
			},
			dateTimePickerVisible: false,
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
			checkDate: moment().startOf("d").subtract(1, "d"),
			reportDate: null,
			// list:[],
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
				caseReportTotal: 0,
				ACTotal_Obs: 0,
				ACTotal_Reg: 0,
				facTotal_Obs: 0,
				facTotal_Reg: 0
			},
			inputs: {
				contractName: '111年度中山區道路巡查維護修繕成效式契約', 
				companyName: '聖東營造股份有限公司',
				serialNumber_21Att_1: '1111102102',
				serialNumber_21Att_2: '1111102103',
				date: '111年11月02日',
				zipCode: '104',
				district: '中山區',
				caseReportTotal: '0',
				ACTotal_Obs: '0',
				ACTotal_Reg: '0',
				facTotal_Obs: '0',
				facTotal_Reg: '0',
				info1_21Att: '無',
				info2_21Att: '無',
				caseReportImg: '', 
				caseReportImg_neo1: '',
				caseReportImg_neo2: '',
				caseReportImg_neo3: ''
			},
		};
	},
	computed: { },
	watch: {},
	created() {	
		// this.template = {};
		this.schemasOri = {};
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
					if(Object.keys(this.list[0].content).length != 0) {
						this.inputs = this.list[0].content.inputs;
						this.inputForm = this.list[0].content.inputForm;
					}
					this.checkDate = this.reportDate = this.list[0].reportDate;
					this.inputs.zipCode = String(this.list[0].zipCode);
					this.initPDF();
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		} else this.$router.push({ path: "/PIIndex/perfReportD/list" });
	},
	mounted() {},
	methods: {
		initPDF() {
			fetch(`/assets/pdf/PI2_1-Att.json?t=${Date.now()}`).then(async (response) => {
				const domContainer = this.$refs.container.$el;
				this.template = await response.json();

				const font = {
					edukai: {
						data: await fetch('/assets/font/edukai-4.0.ttf').then(res => res.arrayBuffer()),
						fallback: true
					},
					// NotoSansTC: {
					// 	data: await fetch('/assets/font/NotoSansTC-Regular.ttf').then(res => res.arrayBuffer()),
					// 	fallback: true
					// }
				};

				const changeInput = (arg) => {
					if(['caseReportTotal', 'ACTotal_Obs', 'ACTotal_Reg', 'facTotal_Obs', 'facTotal_Reg'].includes(arg.key)) this.inputForm[arg.key] = parseInt(arg.value);
					if(['caseReportImg', 'caseReportImg_neo1', 'caseReportImg_neo2','caseReportImg_neo3'].includes(arg.key)) {
						// console.log(arg);
						if(this.schemasOri[arg.key]) {
							this.template.schemas[0][arg.key] = JSON.parse(JSON.stringify(this.schemasOri[arg.key]));
							delete this.schemasOri[arg.key];
							this.form.updateTemplate(this.template);
						}

						this.inputs[arg.key] = this.inputForm[arg.key] = arg.value;

						const img = new Image();
						img.onload = () => {
							// console.log(img.width, img.height);
							const templateWidth = this.template.schemas[0][arg.key].width;
							const templateHeight = this.template.schemas[0][arg.key].height;
							const ratio = Math.min(templateWidth / img.width, templateHeight / img.height);
							// console.log(ratio);

							this.schemasOri[arg.key] = JSON.parse(JSON.stringify(this.template.schemas[0][arg.key]));
							this.template.schemas[0][arg.key].position.x = this.template.schemas[0][arg.key].position.x + (this.template.schemas[0][arg.key].width - img.width * ratio) / 2;
							this.template.schemas[0][arg.key].position.y = this.template.schemas[0][arg.key].position.y + (this.template.schemas[0][arg.key].height - img.height * ratio) / 2;
							this.template.schemas[0][arg.key].width = img.width * ratio;
							this.template.schemas[0][arg.key].height = img.height * ratio;
							this.form.updateTemplate(this.template);
						}
						img.src = arg.value;
					}
				}

				this.form = new Form({ domContainer, template: this.template, inputs: [ this.inputs ], options: { font } });
				this.form.onChangeInput(arg => changeInput(arg));

				for(const [key, value] of Object.entries(this.inputs)) changeInput({ key, value });
				this.getList();
			})
		},
		setPDFinputs() {
			//工程名稱
			const reportDate = moment(this.reportDate).subtract(1911, 'year');
			this.inputs.district = this.districtList[this.inputs.zipCode].name;
			this.inputs.contractName = reportDate.year()+"年度"+this.inputs.district+"道路巡查維護修繕成效式契約";
			//紀錄編號
			for(let i=0; i < this.template.schemas.length; i++) {
				this.inputs[`serialNumber_21Att_${i+1}`] = reportDate.format("YYYYMMDD01").slice(1) + String(i+this.initPage).padStart(2, '0');
			}
			//檢查日期
			const checkDate = moment(this.checkDate).subtract(1911, 'year');
			this.inputs.date = checkDate.format("YYYY年MM月DD日").slice(1);
			//資料數轉換
			let sum = 0
			for(const key of [ 'ACTotal_Obs', 'ACTotal_Reg', 'facTotal_Obs', 'facTotal_Reg' ]) {
				this.inputs[key] = String(this.inputForm[key]);
				//本日通報 加總
				sum += Number(this.inputForm[key]);
			}
			this.inputs.caseReportTotal = String(sum);

			for(const key of [ 'caseReportImg', 'caseReportImg_neo1', 'caseReportImg_neo2', 'caseReportImg_neo3' ]) {
				if(this.inputForm[key]) this.inputs[key] = this.inputForm[key];
			}

			this.form.setInputs([this.inputs]);
			this.form.render();
		},
		getList() {
			this.loading = true;
			const date = moment(this.checkDate).format("YYYY-MM-DD");

			getCaseCount({
				zipCode: Number(this.inputs.zipCode),
				timeStart: date,
				timeEnd: moment(date).add(1, "d").format("YYYY-MM-DD")
			}).then(response => {
				this.inputForm.caseReportTotal = Number(response.data.result.caseReportTotal);
				this.inputForm.ACTotal_Obs = Number(response.data.result.ACTotal_Obs);
				this.inputForm.ACTotal_Reg = Number(response.data.result.ACTotal_Reg);
				this.inputForm.facTotal_Obs = Number(response.data.result.facTotal_Obs);
				this.inputForm.facTotal_Reg = Number(response.data.result.facTotal_Reg);

				this.setPDFinputs();
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		storeData(){
			const storedContent = {
				pageCount:2,
				inputForm:this.inputForm,
				inputs:this.inputs
			}
			setPerfContent(this.listQuery.perfContentId, {
				checkDate: moment(this.checkDate).format("YYYY-MM-DD"),
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

				const filename = "成效式契約指標檢核表(附件)PI-2-1.pdf"; 
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
						path: "/PIIndex/perfReportD/PI2_1",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[0], cidList: this.$route.query.cidList }
					})
					return;
				case 1:
					this.$router.push({
						path: "/PIIndex/perfReportD/PI2_1_Att_2",
						query: { reportId: this.listQuery.reportId, contentId: this.pageTurn[1], cidList: this.$route.query.cidList }
					})
					return;
			}
		}
	}
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.PI2_1-Att
	.filter-container 
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
</style>