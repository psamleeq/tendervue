/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseRouter = {
    path: '/case',
    component: Layout,
		redirect: '/case/statics',
    name: 'case',
    meta: {
      title: '道路銑鋪',
			icon: 'road',
			isNew: true
    },
    children: [
			{
				path: 'caseStatics',
				component: () => import('@/views/case/caseStatics'),
				name: 'caseStatics',
				meta: { title: '維護數量統計', isNew: true }
			},
			{
				path: 'caseList',
				component: () => import('@/views/case/caseList'),
				name: 'caseList',
				meta: { title: '維護案件列表', isNew: true }
			},
			{
				path: 'assignCaseRatio',
				component: () => import('@/views/case/assignCaseRatio'),
				name: 'ratio',
				meta: { title: '交辦案件百分比', isNew: true }
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
						component: () => import('@/views/case/expAnalysis/estimate'),
						name: 'estimate',
						meta: { title: '經費估算', isNew: true }
					},
					{
						path: 'execution',
						component: () => import('@/views/case/expAnalysis/execution'),
						name: 'execution',
						meta: { title: '經費執行', isNew: true }
					},
					{
						path: 'compare',
						component: () => import('@/views/case/expAnalysis/compare'),
						name: 'compare',
						meta: { title: '經費(估算/執行)', isNew: true }
					}
				]
			},
			{
				path: 'inspectCase',
				component: () => import('@/views/case/inspectCase'),
				name: 'inspectCase',
				meta: { title: '巡查統計' }
			},
    ]
  }
  export default caseRouter