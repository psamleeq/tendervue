<template>
	<div class="case-detail">
		<el-table
			:loading="loading"
			empty-text="目前沒有資料"
			:data="detail"
			border
			fit
			highlight-current-row
			:header-cell-style="{ 'background-color': '#F2F6FC' }"
			stripe
			style="width: 100%"
		>
			<el-table-column label="欄位" prop="column" min-width="50" align="center" />
			<el-table-column label="內容" prop="content" min-width="100" align="center">
				<template slot-scope="{ row, column }">
					<span v-if="String(row[column.property]).match(/.JPG|.jpg|.Jpg/g)">
						<el-link v-if="row[column.property].includes('road')" :href="`https:/rm.bim-group.com/${row[column.property]}`" target="_blank" :underline="false">
							<el-image style="width: 100%; height: 100%" :src="`/assets/testPic/${row[column.property].replace('\.\.\/', '')}`" fit="contain" />
						</el-link>
						<el-link v-else :href="`https:/rm.bim-group.com/pic/${row[column.property]}`" target="_blank" :underline="false">
							<el-image style="width: 100%; height: 100%" :src="`/assets/testPic/${row[column.property].replace('\.\.\/', '')}`" fit="contain" />
						</el-link>
						<!-- <el-link :href="`/assets/testPic/${row[column.property].replace('\.\.\/', '')}`" target="_blank">{{ row[column.property].replace('\.\.\/', '') }}</el-link> -->
					</span>
					<span v-else>
						<span>{{ row[column.property] || "-" }}</span>
					</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import moment from "moment";
import { getCaseDetail } from "@/api/dispatch";

export default {
	name: "caseDetail",
	props: {
		loading: {
			required: true,
			type: Boolean
		},
		showDetailDialog: {
			required: true,
			type: Boolean
		},
		deviceTypeNow: {
			required: true,
			type: Number
		}
	},
	data() {
		return {
			headersDetail: {
				casetype: {
					name: "查報來源",
				},
				SerialNo: {
					name: "系統編號",
				},
				CaseSN: {
					name: "申請單號",
				},
				paperkind: {
					name: "申請單類別",
				},
				run1tflag: {
					name: "申請單流程",
				},
				TBName: {
					name: "區別",
				},
				Postal_vil: {
					name: "里別",
				},
				CaseSucc: {
					name: "通報單號",
				},
				CaseNo: {
					name: "案件編號",
				},
				DateCreate: {
					name: "成案日期",
				},
				reporter: {
					name: "查報人員",
				},
				Place: {
					name: "案件地點",
				},
				CaseStatus: {
					name: "案件類型",
				},
				CaseProcess: {
					name: "案件流程",
				},
				Formula: {
					name: "算式及面積",
					deviceTypeFilter: [1, 2]
				},
				MillingDepth: {
					name: "刨鋪深度",
					deviceTypeFilter: [1, 2]
				},
				position: {
					name: "案件位置",
				},
				ImgZoomIn: {
					name: "施工前近照",
				},
				ImgZoomOut: {
					name: "施工前遠照",
				}
			},
			detail: [],
			options: {
				RoadType: {
					1: "道路",
					2: "設施",
					3: "橋涵"
				},
				DistressLevel: {
					1: "輕度",
					2: "中度",
					3: "重度"
				},
				paperkind: {
					1: "銑鋪申請單",
					2: "設施申請單",
					3: "標線申請單",
					4: "坑洞臨補單",
					5: "分隊交辦案件",
					6: "塗佈申請單"
				},
				run1tflag: {
					0: "未送件",
					"s": "未印申請單",
					"a": "組長審核",
					"b": "主任審核",
					"c": "主任抽件",
					"d": "監造應送分隊",
					"e": "分隊審核",
					"f": "隊部審核",
					"g": "分隊回公司審核",
					1: "分隊抽件",
					2: "隊部抽件",
					3: "分隊交辦",
					4: "已完成申請單"  
				}
			}
		}
	},
	computed: {	
		headersDetailFilter() {
			let headersDetailFilter = {};
			Object.keys(this.headersDetail).forEach(key => {
				const props = this.headersDetail[key];
				if(!props.hasOwnProperty('deviceTypeFilter')) headersDetailFilter[key] = props;
				else if(props.deviceTypeFilter.includes(this.deviceTypeNow)) headersDetailFilter[key] = props;
			})
			return headersDetailFilter
		},
	},
	methods: {
		getDetail(row) {
			this.detail = [];

			getCaseDetail({ serialNo: row.SerialNo, deviceType: this.deviceTypeNow }).then(response => {
				if (response.data.list.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					const caseObj = response.data.list[0];
					// console.log(caseObj);

					for(const key in this.headersDetailFilter) {
						if(key == 'CaseStatus') this.detail.push({ column: this.headersDetail[key].name, content: `${this.options.RoadType[caseObj.RoadType]} ${caseObj.DName} ${caseObj.DistressName} ${this.options.DistressLevel[caseObj.DistressLevel]}` });
						else if(key == 'CaseProcess') {
							let content = "";

							// 主任分派
							if(!caseObj.DatePlan) content += "主任未分派、";
							else content += `主任 ${this.formatDate(caseObj.DatePlan)} 已分派、`;

							// 工班施工
							if(!caseObj.DateAssign) content += "工班未派施工、";
							else content += `工班 ${this.formatDate(caseObj.DateAssign)} 已派施工、`;

							// 已報完工
							if(!caseObj.DateClose) content += "未報完工、";
							else content += `${this.formatDate(caseObj.DateClose)} 已報完工、`

							// TODO: 坑洞臨補
							// if(caseObj.SCType2Flag == "1") content += "坑洞臨補  ";
							// else if(caseObj.SCType2Flag == "2") content += "坑洞臨補已完工、";

							// TODO: 熱再生
							// if(caseObj.CType4 == "1") content += `熱再生主任已分派、`;
							// else if(caseObj.CType4 == "2") content += `熱再生 ${caseObj.CType4date} 已派施工、`;
							// else if(caseObj.CType4 == "3") content += `熱再生 ${caseObj.CType4date} 已派施工，熱再生 ${caseObj.page4t} 已完工、`;

							content = content.replace(/、$/, "");
							this.detail.push({ column: this.headersDetailFilter[key].name, content });
						} else if(['DateCreate'].includes(key)) this.detail.push({ column: this.headersDetailFilter[key].name, content: this.formatDate(caseObj[key]) }); 
						else if(key == 'Formula') this.detail.push({ column: this.headersDetailFilter[key].name, content: caseObj.MillingFormula != '0' ? `${caseObj.MillingFormula} = ${caseObj.MillingArea}` : `${caseObj.MillingLength}*${caseObj.MillingWidth} = ${caseObj.MillingArea}` });
						else if(key == 'position') this.detail.push({ column: this.headersDetailFilter[key].name, content: `(${caseObj.CoordinateX}, ${caseObj.CoordinateY})` });
						else if(['paperkind', 'run1tflag'].includes(key)) this.detail.push({ column: this.headersDetailFilter[key].name, content: this.options[key][caseObj[key]] });
						else this.detail.push({ column: this.headersDetailFilter[key].name, content: caseObj[key] || "-" });
					}
				}
				this.$emit('update:loading', false);
				this.$emit('update:showDetailDialog', true);
			}).catch(err => this.$emit('update:loading', false));
		},
		formatDate(time) {
			return moment(time).format("YYYY-MM-DD");
		},
	}
}
</script>

<style>

</style>