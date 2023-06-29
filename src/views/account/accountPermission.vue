<template>
	<div class="app-container" v-loading="loading">
		<h2>帳號權限管理</h2>
		
		<div class="filter-container">
			<div class="filter-item">
				帳號:{{accountData.row.UserName}}
			</div>
		</div>
		<el-tree
			ref="tree"
			:data="treeData"
			node-key="id"
			show-checkbox
			@check="handleCheck"
		>
			<span slot-scope="{ node, data }" :style="node.level === 1 ? { fontSize: '18px',lineHeight: 2 } : {}">
				{{ data.label }}
			</span>
		</el-tree>
		<div class="button-container">
			<el-button type="info" @click="undo()">取消重置</el-button>
			<el-button type="success" @click="comfirmPermission()">確認送出</el-button>
		</div>
		
	</div>
</template>

<script>
/* Router Modules */
// 如果有新增路由要在這裡添加，並且到permissionTree涵式中添加...formatRoutes([]),
import accountList from '@/router/modules/account';
import unitRouter from '@/router/modules/unit';
import inspectionRouter from '@/router/modules/inspection'; 
import caseRouter from '@/router/modules/case';
import caseHistRouter from '@/router/modules/caseHist';
import dispatchV0Router from '@/router/modules/dispatchV0';
import dispatchRouter from '@/router/modules/dispatch';
import PCIRouter from '@/router/modules/PCI';
import expAnalysisRouter from '@/router/modules/expAnalysis';
import PIRouter from '@/router/modules/PI';
import otherRouter from '@/router/modules/other';
import carRouter from '@/router/modules/car';
import priceRouter from '@/router/modules/price';


export default {
	data() {
		return {
			loading: false,
			treeData: [],
			nodeIdCounter: 0, // 用於生成唯一節點ID
			accountData:{
			},
			checkedKeys: []
		};
	},
	created() {
		this.permissionTree();
	},
	mounted() {
		this.loading = true;
		const apiResponse = { roles: ["restored","restored.viewer","restored.assign","restored.order","restored.reporter","PIcase","PIcase.viewer","PIcase.inspector","PIcase.supervisor","PIcase.editor","PIcase.analyst","beta","PIreport","PIreport.21","PIreport.31","Pricing","Pricing.viewer","inspection","inspection.viewer","inspection.marker","distress","distress.viewer","distress.inspector","distress.inspectorMAP","distress.inspectorMaster","distress.inspectorOrtho","car","car.viewer","car.route","rAdm"] };
		if (this.$route.query) {
			this.accountData.row = this.$route.query;
		}

		apiResponse.roles.forEach(role => {
			this.checkRole(this.treeData, role);
			this.loading = false;
		});
	},
	methods: {
		//自動生成ID
		generateNodeId() {
			const nodeId = this.nodeIdCounter.toString();
			this.nodeIdCounter++;
			return nodeId;
		},
		checkRole(nodes, role) {
			// console.log(nodes)
			nodes.forEach(node => {
				// console.log(node.roles);
				if (node.roles.includes(role)) {
					this.$nextTick(() => {
						this.$refs.tree.setChecked(node, true);
					});
				}
				if (node.children && node.children.length > 0) {
					this.checkRole(node.children, role);
				}

			});
		},
		handleCheck(data,checked) {
			const selectedPermissions = [];
			checked.checkedNodes.forEach(node => {
				const { roles } = node;
				if (roles && roles.length > 0) {
					selectedPermissions.push(...roles);
				}
			});
			//去重
			this.checkedKeys = Array.from(new Set(selectedPermissions))
		},
		//路由規則轉樹型控件格式
		permissionTree() {
			const formatRoutes = (routes) => {
				// console.log(routes);
				const permissionTree = routes.map(route => {
					const node = {
						id: this.generateNodeId(),
						label: route.meta.title,
						roles: route.meta.roles,
					};
					if (route.children && route.children.length > 0) {
						node.children = formatRoutes(route.children);
					}
					return node;
				});
				return permissionTree;
			};
			
			this.treeData = [
				...formatRoutes([accountList]),
				...formatRoutes([unitRouter]),
				...formatRoutes([inspectionRouter]),
				...formatRoutes([caseRouter]),
				...formatRoutes([caseHistRouter]),
				...formatRoutes([dispatchV0Router]),
				...formatRoutes([dispatchRouter]),
				...formatRoutes([PCIRouter]),
				...formatRoutes([expAnalysisRouter]),
				...formatRoutes([PIRouter]),
				...formatRoutes([carRouter]),
				...formatRoutes([otherRouter]),
				...formatRoutes([priceRouter]),
			];
			
		},
		undo(){

		},
		comfirmPermission(){
			// 將選中的權限訊息傳給API
			// this.callApi(this.checkedKeys);
		}
	},
	
};
</script>

<style lang="sass">
	.filter-container
		.filter-item
			margin-right: 5px
	.button-container
		display: flex
		justify-content: center
		margin-top: 20px
</style>