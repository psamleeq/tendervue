/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const PIRouter = {
	path: '/PIIndex',
	component: Layout,
	redirect: '/PI/precipitation',
	name: 'PIIndex',
	meta: {
		title: '成效指標',
		icon: 'el-icon-s-check',
		roles: ['PIcase', 'PIreport']
	},
	children: [
		{
			path: 'caseCheck',
			component: {
				render: (c) => c('router-view')
			},
			name: 'caseCheck',
			redirect: 'noRedirect',
			meta: {
				title: '案件稽核',
				roles: ['PIcase.viewer', 'PIcase.inspector', 'PIcase.supervisor', 'PIcase.editor']
			},
			children: [
				{
					path: 'caseList',
					component: () => import('@/views/PI/caseCheck/caseList'),
					name: 'PICaseList',
					meta: {
						title: '案件列表',
						roles: ['PIcase.viewer', 'PIcase.inspector', 'PIcase.supervisor', 'PIcase.editor']
					}
				},
				{
					path: 'caseList_unaccepted',
					component: () => import('@/views/PI/caseCheck/caseList_unaccepted'),
					name: 'PICaseList_unaccepted',
					meta: {
						title: '不合理案件申覆',
						roles: ['PIcase.viewer', 'PIcase.inspector', 'PIcase.supervisor', 'PIcase.editor'],
						isNew: true
					}
				},
				{
					path: 'checkResult',
					component: () => import('@/views/PI/caseCheck/checkResult'),
					name: 'PICheckResult',
					meta: {
						title: '稽核結果',
						roles: ['PIcase.viewer']
					}
				},
				{
					path: 'caseUpload',
					component: () => import('@/views/PI/caseCheck/caseUpload'),
					name: 'PICaseUpload',
					meta: {
						title: '案件上傳',
						roles: ['PIcase.editor']
					}
				},
			]
		},
		{
			path: 'perfReportD',
			component: {
				render: (c) => c('router-view')
			},
			name: 'perfReportD',
			redirect: 'noRedirect',
			meta: { 
				title: '日報表', 
				roles: ['PIreport'],
				vTag: 'Alpha' 
			},
			children: [
				// {
				// 	path: 'perfList',
				// 	component: () => import('@/views/PI/expAnalysis/estimate'),
				// 	name: 'perfList',
				// 	meta: { 
				// 		title: '成效資訊', 
				// 		roles: ['beta'],
				// 		vTag: 'Alpha' 
				// 	}
				// },
				{
					path: 'PI2_1_Att',
					component: () => import('@/views/PI/perfReport/PI2_1_Att'),
					name: 'PI2_1_Att',
					meta: { 
						title: 'PI2.1附件', 
						roles: ['PIreport.21'],
						vTag: 'Alpha' 
					}
				},
				{
					path: 'PI3_1_Att',
					component: () => import('@/views/PI/perfReport/PI3_1_Att'),
					name: 'PI3_1_Att',
					meta: {
						title: 'PI3.1附件',
						roles: ['PIreport.31'],
						vTag: 'Alpha'
					}
				}
			]
		},
		{
			path: 'mCaseStatics',
			component: () => import('@/views/PI/mCaseStatics'),
			name: 'mCaseStatics',
			meta: { 
				roles: ['PIcase.analyst'],
				title: '維護數量統計' 
			}
		},
		{
			path: 'mCaseList',
			component: () => import('@/views/PI/mCaseList'),
			name: 'mCaseList',
			meta: { 
				title: '維護案件列表', 
				roles: ['PIcase.analyst']
			}
		},
		{
			path: 'inspectCase',
			component: () => import('@/views/PI/inspectCase'),
			name: 'inspectCase',
			meta: { 
				title: '缺失分析',
				roles: ['PIcase.analyst']
			}
		},
		{
			path: 'caseWarrantyList',
			component: () => import('@/views/PI/caseWarrantyList'),
			name: 'caseWarrantyList',
			meta: { 
				title: '保固案件列表', 
				roles: ['PIcase.analyst'],
				vTag: 'Alpha'
			}
		},
	]
}
export default PIRouter