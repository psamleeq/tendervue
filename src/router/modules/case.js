/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseRouter = {
    path: '/case',
    component: Layout,
		redirect: '/case/statics',
    name: 'case',
    meta: {
      title: '道路銑鋪',
			icon: 'el-icon-truck',
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
				path: 'ratio',
				component: () => import('@/views/case/ratio'),
				name: 'ratio',
				meta: { title: '交辦案件百分比', isNew: true }
			},
			// {
			// 	path: 'share',
			// 	component: () => import('@/views/PCI/share'),
			// 	name: 'share',
			// 	meta: { title: '預算規劃與執行', isNew: true }
			// },
			// {
			// 	path: 'share',
			// 	component: () => import('@/views/PCI/share'),
			// 	name: 'share',
			// 	meta: { title: '月執行圖表', isNew: true }
			// },
			{
				path: 'inspectCase',
				component: () => import('@/views/case/inspectCase'),
				name: 'inspectCase',
				meta: { title: '巡查統計', isNew: true }
			},
    ]
  }
  export default caseRouter