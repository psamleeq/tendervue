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
		isNew: true
	},
	children: [
		{
			path: 'caseList',
			component: () => import('@/views/PI/caseList'),
			name: 'PICaseList',
			meta: { title: '案件列表', isNew: true }
		},
		{
			path: 'caseUpload',
			component: () => import('@/views/PI/caseUpload'),
			name: 'PICaseUpload',
			meta: { title: '案件上傳', isNew: true }
		},
		{
			path: 'mCaseStatics',
			component: () => import('@/views/PI/mCaseStatics'),
			name: 'mCaseStatics',
			meta: { title: '維護數量統計' }
		},
		{
			path: 'mCaseList',
			component: () => import('@/views/PI/mCaseList'),
			name: 'mcaseList',
			meta: { title: '維護案件列表', isNew: true }
		},
		{
			path: 'inspecCaseList',
			component: () => import('@/views/PI/inspecCaseList'),
			name: 'inspecCaseList',
			meta: { title: '派工紀錄', isNew: true }
		},
		{
			path: 'assignCaseRatio',
			component: () => import('@/views/PI/assignCaseRatio'),
			name: 'ratio',
			meta: { title: '交辦案件百分比' }
		},
		{
			path: 'expAnalysis',
			component: {
				render: (c) => c('router-view')
			},
			name: 'expAnalysis',
			redirect: 'noRedirect',
			meta: { title: '經費分析', isNew: true },
			children: [
				{
					path: 'estimate',
					component: () => import('@/views/PI/expAnalysis/estimate'),
					name: 'estimate',
					meta: { title: '經費估算', isNew: true }
				},
				{
					path: 'execution',
					component: () => import('@/views/PI/expAnalysis/execution'),
					name: 'execution',
					meta: { title: '經費執行', isNew: true }
				},
				{
					path: 'compare',
					component: () => import('@/views/PI/expAnalysis/compare'),
					name: 'compare',
					meta: { title: '經費(估算/執行)', isNew: true }
				}
			]
		},
		{
			path: 'inspectCase',
			component: () => import('@/views/PI/inspectCase'),
			name: 'inspectCase',
			meta: { title: '巡查統計' }
		},
	]
}
export default otherRouter