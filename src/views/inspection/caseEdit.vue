<template>
	<div class="app-container case-edit">
		<h3>缺失編輯</h3>
		<el-form label-position="left" :model="form" :rules="rules" ref="form" label-width="200px" class="case-edit-form">
			<el-form-item prop="id" label="缺失Id">
				<span>{{ form.id }}</span>
			</el-form-item>
			<el-form-item prop="SerialNo" label="查報案號">
				<span>{{ form.SerialNo }}</span>
			</el-form-item>
			<el-form-item prop="Postal_vil" label="案件里別">
				<el-input v-model="form.Postal_vil" style="width:300px;margin-right:10px" size="small" />
			</el-form-item>
			<el-form-item prop="Place" label="案件地點">
				<el-input v-model="form.Place" size="small" />
			</el-form-item>
			<el-form-item prop="Direction" label="車道">
				<el-input class="road-dir" v-model="form.Lane" size="mini">
					<el-select slot="prepend" v-model="form.Direction" popper-class="type-select" size="mini">
						<el-option v-for="(name, id) in options.roadDir" :key="id" :label="name" :value="Number(id)" />
					</el-select>
				</el-input>
			</el-form-item>
			<el-form-item label="成案日期" prop="DateReport" required>
				<el-date-picker v-model="form.DateReport" type="date" placeholder="選擇日期" size="small" />
			</el-form-item>
			<el-form-item label="道路類型" prop="type" size="small">
				<el-radio-group v-model="form.RoadType">
					<el-radio :label="1">道路</el-radio>
					<el-radio :label="2">熱再生</el-radio>
					<el-radio :label="3">設施</el-radio>
					<!-- <el-radio label="標線" /> -->
				</el-radio-group>
			</el-form-item>
			<!-- <el-form-item label="設施類型(大分類)" prop="type">
				<el-select v-model="form.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="AC" />
					<el-option label="設施" value="facility" />
				</el-select>
			</el-form-item> -->
			<!-- <el-form-item label="規格形狀" prop="type">
				<el-select v-model="form.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item> -->
			
			<el-form-item label="損壞類別" prop="DistressType">
				<div style="display:flex">
					<el-select class="edit-select" v-model.number="form.DistressType" size="mini" popper-class="type-select">
						<el-option v-for="(name, type) in options.DistressType" :key="`DistressType_${type}`" :label="name" :value="Number(type)" />
					</el-select>
					<!-- <div style="margin-left:10px">若為其他請輸入：<el-input type="text" style="width:500px" size="small"></el-input></div> -->
				</div>
			</el-form-item>
			<el-form-item label="損壞狀況" prop="type">
				<el-select class="edit-select" v-model.number="form.DistressLevel" size="mini" popper-class="type-select">
					<el-option v-for="(name, type) in options.DistressLevel" :key="`DistressLevel_${type}`" :label="name" :value="Number(type)" />
				</el-select>
			</el-form-item>
			<!-- <el-form-item label="維修處數" prop="type">
				<div style="display:flex">
					<el-select v-model="form.region" placeholder="請選擇" size="small">
						<el-option label="1" value="shanghai"></el-option>
						<el-option label="2" value="beijing"></el-option>
					</el-select>
					<div style="margin-left:10px">若為0可選其他說明：<el-input type="text" style="width:500px" size="small"></el-input></div>
				</div>
			</el-form-item> -->
			<!-- <el-form-item label="粒料規格" prop="type">
				<el-select v-model="form.region" placeholder="請選擇" size="small">
					<el-option label="1" value="shanghai"></el-option>
					<el-option label="2" value="beijing"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item label="預估銑刨深度" prop="MillingDepth">
				<el-radio-group v-model="form.MillingDepth">
					<el-radio :label="0">0cm</el-radio>
					<el-radio :label="4">4cm</el-radio>
					<el-radio :label="5">5cm</el-radio>
					<el-radio :label="10">10cm</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="預估銑鋪面積" prop="desc">
				<el-row v-if="form.editFormula" :gutter="5" type="flex" align="middle">
					<el-col :span="4"><el-tag class="btn-tag" type="success" @click="form.editFormula = false; calArea(form);">自訂</el-tag></el-col>
					<el-col :span="20"><el-input v-model="form.MillingFormula" @change="calArea(form)" /></el-col>
				</el-row>
				<el-row v-else :gutter="5" type="flex" align="middle">
					<el-col :span="4"><el-tag class="btn-tag" @click="form.editFormula = true; calArea(form);">簡單</el-tag></el-col>
					<el-col :span="8"><el-input v-model="form.MillingLength" @change="calArea(form)" /></el-col>
					<el-col :span="2" style="line-height: 36px"> ✕ </el-col>
					<el-col :span="8"><el-input v-model="form.MillingWidth" @change="calArea(form)" /></el-col>
				</el-row>
			</el-form-item>
			<!-- <el-form-item label="銑鋪複雜算式" prop="desc">
				<el-input v-model="form.region" size="small"></el-input>
			</el-form-item> -->
			
			<el-form-item label="是否需派工" prop="type">
				<el-checkbox label="不須派工" name="type" size="small"></el-checkbox>
			</el-form-item>
			<!-- <el-form-item label="備註(管線)" prop="type">
				<div style="display:flex">
					<el-input type="text" size="small" style="width:600px"></el-input>
					<div style="margin-left:10px">(請輸入市容查報編號)</div>
				</div>
			</el-form-item> -->
			<!-- <el-form-item label="巡路員" prop="type">
				<el-select v-model="form.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item> -->
			<!-- <el-form-item label="負責人員" prop="type">
				<el-select v-model="form.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item> -->
		</el-form>
		<div style="display:flex;margin-top:50px;justify-content:center">
			<el-button type="primary" @click="submitForm('form')">確定</el-button>
			<el-button @click="resetForm('form')">取消</el-button>
		</div>
	</div>
</template>

<script>
import { getCaseTrackingSpec } from "@/api/inspection";

export default {
	name: "caseEdit",
	data() {
		return {
			loading: false,
			list: [],
			form: {
				Place: '',
				Direction: 0,
				Land: 0,
				DateReport: '',
				editFormula: false
			},
			rules: {
				Place: [
					{ required: true, message: '必填', trigger: 'blur' }
				],
				Direction: [
					{ required: true, message: '必填', trigger: 'blur' }
				],
				DateReport: [
					{ type: 'date', required: true, message: '必填', trigger: 'change' }
				],
			},
			options: {
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
					// 0: "全部",
					1: "輕",
					2: "中",
					3: "重"
				},
				roadDir: {
					// 0: "無",
					1: "順",
					2: "逆"
				}
			}
		};
	},
	computed: {	
	},
	watch: { },
	created() {
		if(this.$route.query.caseId) {
			getCaseTrackingSpec(this.$route.query.caseId, {}).then(response => {
				this.form = response.data.list;
				this.form.DateReport = this.formatTime(this.form.DateReport);
				for (const col of ['MillingDepth', 'MillingLength', 'MillingWidth', 'MillingArea']) 
						if(Number(this.form[col])) this.form[col] = Math.round(this.form[col] * 1000) / 1000;
				this.$set(this.form, "editFormula", this.form.MillingFormula != '0');
			});
		} else this.$router.push({ path: "/inspection/caseTrackingList" });
	},
	mounted() {
		// console.log(this.$route);
	},
	methods: {
		submitForm(formName) {
			this.$refs[formName].validate((valid) => {
				if (valid) {
					alert('submit!');
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		calArea(form) {
			const replaceObj = { " ": "", "m": "", "M": "", "=": "", "＝": "", "＋": "+", "－": "-", "＊": "*", "x": "*", "X": "*", "×": "*", "／": "/", "（": "(", "）": ")",
				"０": '0', "１": "1", "２": "2", "３": "3", "４": "4", "５": "5", "６": "6", "７": "7", "８": "8", "９": "9" };
			// const regex = new RegExp('^[0-9*+\/().-]+$', 'g');
			const regex = /^[^*+/-](?:[*+/\-]?[(]*\d+\.?\d*[)]*)+$/g;
			
			if( (form.editFormula == undefined && form.MillingFormula && form.MillingFormula != '0' && form.MillingFormula.length != 0) || form.editFormula)  {
				for(const key in replaceObj) form.MillingFormula = form.MillingFormula.replaceAll(key, replaceObj[key]);
				form.MillingArea = regex.test(form.MillingFormula) ? Math.round(new Function(`return ${form.MillingFormula}`)() * 100) / 100 : 0;
			} else form.MillingArea = Math.round(form.MillingLength * form.MillingWidth * 100) / 100;
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD");
		}
	}
};
</script>

<style lang="sass">
.case-edit
	.case-edit-form
		width: 60vw
		max-width: 600px
		// margin: auto
		.road-dir 
			width: 160px
			.el-input__inner
				text-align: center
			& > .el-input-group__prepend .el-select
				width: 80px
		.btn-tag
				cursor: pointer
</style>