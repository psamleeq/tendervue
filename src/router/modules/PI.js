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
		roles: ['PIcase'],
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
export default PIRouter