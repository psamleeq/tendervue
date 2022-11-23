/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const otherRouter = {
	path: '/PIIndex',
	component: Layout,
	redirect: '/PI/precipitation',
	name: 'PIIndex',
	meta: {
		title: '成效指標',
		icon: 'el-icon-s-check',
		roles: ['PIcase.viewer'],
		isNew: true
	},
	children: [
		// {
		// 	path: 'perfReport',
		// 	component: {
		// 		render: (c) => c('router-view')
		// 	},
		// 	name: 'perfReport',
		// 	redirect: 'noRedirect',
		// 	meta: { 
		// 		title: '成效回報', 
		// 		roles: ['beta'],
		// 		vTag: 'Alpha' 
		// 	},
		// 	children: [
		// 		// {
		// 		// 	path: 'perfList',
		// 		// 	component: () => import('@/views/PI/expAnalysis/estimate'),
		// 		// 	name: 'perfList',
		// 		// 	meta: { 
		// 		// 		title: '成效資訊', 
		// 		// 		roles: ['beta'],
		// 		// 		vTag: 'Alpha' 
		// 		// 	}
		// 		// },
		// 		{
		// 			path: 'PI2_1_Att',
		// 			component: () => import('@/views/PI/perfReport/PI2_1_Att'),
		// 			name: 'PI2_1_Att',
		// 			meta: { 
		// 				title: '日報表-PI2.1附件', 
		// 				roles: ['beta'],
		// 				vTag: 'Alpha' 
		// 			}
		// 		}
		// 	]
		// },
		{
			path: 'caseList',
			component: () => import('@/views/PI/caseList'),
			name: 'PICaseList',
			meta: {
				title: '案件列表', 
				roles: ['PIcase.viewer', 'PIcase.inspector', 'PIcase.supervisor', 'PIcase.editor'],
				isNew: true
			}
		},
		{
			path: 'caseUpload',
			component: () => import('@/views/PI/caseUpload'),
			name: 'PICaseUpload',
			meta: { 
				title: '案件上傳', 
				roles: ['PIcase.editor'],
				isNew: true 
			}
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
			path: 'assignCaseRatio',
			component: () => import('@/views/PI/assignCaseRatio'),
			name: 'ratio',
			meta: { 
				title: '交辦案件百分比',
				roles: ['PIcase.analyst']
			}
		},
		{
			path: 'expAnalysis',
			component: {
				render: (c) => c('router-view')
			},
			name: 'expAnalysis',
			redirect: 'noRedirect',
			meta: { 
				title: '經費分析', 
				roles: ['PIcase.analyst']
			},
			children: [
				{
					path: 'estimate',
					component: () => import('@/views/PI/expAnalysis/estimate'),
					name: 'estimate',
					meta: { 
						title: '經費估算', 
						roles: ['PIcase.analyst'],
						isNew: true
					}
				},
				{
					path: 'execution',
					component: () => import('@/views/PI/expAnalysis/execution'),
					name: 'execution',
					meta: { 
						title: '經費執行', 
						roles: ['PIcase.analyst'],
						isNew: true 
					}
				},
				{
					path: 'compare',
					component: () => import('@/views/PI/expAnalysis/compare'),
					name: 'compare',
					meta: { 
						title: '經費(估算/執行)',
						roles: ['PIcase.analyst'],
						isNew: true 
					}
				}
			]
		},
		{
			path: 'inspectCase',
			component: () => import('@/views/PI/inspectCase'),
			name: 'inspectCase',
			meta: { 
				title: '巡查統計',
				roles: ['PIcase.analyst']
			}
		},
	]
}
export default otherRouter