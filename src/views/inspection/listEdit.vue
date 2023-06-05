<template>
	<div class="app-container">
		<h3>編輯缺失列表</h3>
		<div class="filter-container">
			<div class="filter-item">
				<div class="el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
					<span>輸入道管編號</span>
					</div>
					<el-input type="text"></el-input>
				</div>
			</div>
			<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
		</div>

		<el-divider/>

		<el-form label-position="left" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="150px" class="demo-ruleForm">
			<el-form-item label="報案種類" prop="name">
				<div style="display:flex">
					<el-input v-model="ruleForm.name" size="small" style="width:300px"></el-input>
					<div style="margin-left:10px;color:red">※若道路巡查類別非「道路巡查」，才可輸入同案案號。</div>
					<div style="margin-left:10px"><el-checkbox label="機關交辦"></el-checkbox></div>
				</div>
			</el-form-item>
			<el-form-item label="查報案號" prop="region">
				<div style="display:flex">
					<el-input v-model="ruleForm.region" size="small" style="width:300px"></el-input>
					<div style="margin-left:10px">同案案號：<el-input type="text" style="width:300px"></el-input></div>
				</div>
			</el-form-item>
			<el-form-item label="新工處道管編號" prop="region">
				<div style="display:flex">
					<el-input v-model="ruleForm.region" size="small" style="width:300px"></el-input>
					<div style="margin-left:10px;">請輸入新工處道管系統編號，非新工處道管系統案件不能印申請單、申請回報單</div>
				</div>
			</el-form-item>
			<el-form-item label="案件里別" prop="region">
				<el-input v-model="ruleForm.region" style="width:300px;margin-right:10px" size="small"></el-input>
				<el-select v-model="ruleForm.region" placeholder="請選擇里別" size="small">
					<el-option label="区域一" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="案件地點" prop="region">
				<el-input v-model="ruleForm.region" size="small"></el-input>
			</el-form-item>
			<el-form-item label="案件內容" prop="region">
				<el-input type="textarea" v-model="ruleForm.region" size="small"></el-input>
			</el-form-item>
			<el-form-item label="成案日期" prop="region" required>
				<el-date-picker type="date" placeholder="選擇日期" v-model="ruleForm.region" size="small"></el-date-picker>
			</el-form-item>
			<el-form-item label="預計成案日期" prop="region" required>
				<el-date-picker type="date" placeholder="選擇日期" v-model="ruleForm.region" size="small"></el-date-picker>
			</el-form-item>
			<el-form-item label="報案日期" prop="region" required>
				<el-date-picker type="date" placeholder="選擇日期" v-model="ruleForm.region" size="small"></el-date-picker>
			</el-form-item>

			<el-divider>*以上為必要欄位</el-divider>

			<el-form-item label="臨補、標線、送件" prop="type">
				<el-checkbox label="熱再生修復" name="type" size="small"></el-checkbox>
			</el-form-item>
			<el-form-item label="道路類型" prop="type" size="small">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="道路" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="設施類型(大分類)" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="規格形狀" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="車道方向及車道數" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="損壞類別" prop="type">
				<div style="display:flex">
					<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
						<el-option label="AC路面" value="shanghai"></el-option>
						<el-option label="区域二" value="beijing"></el-option>
					</el-select>
					<div style="margin-left:10px">若為其他請輸入：<el-input type="text" style="width:500px" size="small"></el-input></div>
				</div>
			</el-form-item>
			<el-form-item label="維修處數" prop="type">
				<div style="display:flex">
					<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
						<el-option label="1" value="shanghai"></el-option>
						<el-option label="2" value="beijing"></el-option>
					</el-select>
					<div style="margin-left:10px">若為0可選其他說明：<el-input type="text" style="width:500px" size="small"></el-input></div>
				</div>
			</el-form-item>
			<el-form-item label="粒料規格" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="1" value="shanghai"></el-option>
					<el-option label="2" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="預估銑刨深度" prop="resource">
				<el-radio-group v-model="ruleForm.resource">
					<el-radio label="0cm"></el-radio>
					<el-radio label="4cm"></el-radio>
					<el-radio label="5cm"></el-radio>
					<el-radio label="10cm"></el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="預估銑鋪面積" prop="desc">
				<div style="display:flex">
					長<el-input v-model="ruleForm.desc" style="width:100px" size="small"></el-input>
					寬<el-input v-model="ruleForm.desc" style="width:100px" size="small"></el-input>
					(公尺)
				</div>
			</el-form-item>
			<el-form-item label="銑鋪複雜算式" prop="desc">
				<el-input v-model="ruleForm.region" size="small"></el-input>
			</el-form-item>
			<el-form-item label="塗佈複雜算式" prop="desc">
				<el-input v-model="ruleForm.region" size="small"></el-input>
			</el-form-item>
			<el-form-item label="維修處數" prop="type">
				<div style="display:flex">
					<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
						<el-option label="1" value="shanghai"></el-option>
						<el-option label="2" value="beijing"></el-option>
					</el-select>
					<div style="margin-left:10px">若為0可選其他說明:<el-input type="text" style="width:500px" size="small"></el-input></div>
				</div>
			</el-form-item>
			<el-form-item label="損壞狀況" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="是否需派工" prop="type">
				<el-checkbox label="不須派工" name="type" size="small"></el-checkbox>
			</el-form-item>
			<el-form-item label="管線單位(管線)" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="台灣電力公司" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="備註(質線)" prop="type">
				<div style="display:flex">
					<el-input type="text" size="small" style="width:600px"></el-input>
					<div style="margin-left:10px">(請輸入市容查報編號)</div>
				</div>
			</el-form-item>
			<el-form-item label="巡路員" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="負責人員" prop="type">
				<el-select v-model="ruleForm.region" placeholder="請選擇" size="small">
					<el-option label="AC路面" value="shanghai"></el-option>
					<el-option label="区域二" value="beijing"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<div style="display:flex;margin-top:50px;justify-content:center">
			<el-button type="primary" @click="submitForm('ruleForm')">確定修改</el-button>
			<el-button @click="resetForm('ruleForm')">取消(重置)</el-button>
		</div>
	</div>
</template>

<script>

export default {
	name: "jobTicketEdit",
	data() {
		return {
			loading: false,
			list: [],
			ruleForm: {
				name: '',
				region: '',
				date1: '',
				date2: '',
				delivery: false,
				type: [],
				resource: '',
				desc: ''
			},
			rules: {
				name: [
				{ required: true, message: '必填', trigger: 'change' }
				],
				region: [
				{ required: true, message: '必填', trigger: 'change' }
				],
				date1: [
				{ type: 'date', required: true, message: '必填', trigger: 'change' }
				],
				date2: [
				{ type: 'date', required: true, message: '必填', trigger: 'change' }
				],
				
			}
		};
	},
	computed: {	
	},
	watch: { },
	async created() {

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
		}
	}
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
// .el-form-item
// 	.el-form-item__label
// 		background-color: #F2F6FC
// 		border-radius: 5px
</style>