/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseRouter = {
	path: '/case',
	component: Layout,
	redirect: '/case/list',
	name: 'road',
	meta: {
		title: '缺失管理',
		icon: 'el-icon-s-release', 
		roles: ['distress'],
		isNew: true
	},
	children: [
		{
			path: 'caseList',
			component: () => import('@/views/case/list'),
			name: 'caseList',
			meta: { 
				title: '缺失列表', 
				roles: ['distress.viewer'],
				isNew: true
			}
		},
		{
			path: 'caseMap',
			component: () => import('@/views/case/caseMap'),
			name: 'caseMap',
			meta: { 
				title: '缺失地圖', 
				roles: ['distress.viewer'],
				isNew: true
			}
		},
		{
			path: 'roadStatus',
			component: () => import('@/views/case/roadStatus'),
			name: 'roadStatus',
			meta: { 
				title: '路況查詢', 
				roles: ['distress.inspector'],
				isNew: true
			}
		},
		{
			path: 'PCIMap',
			component: () => import('@/views/case/PCIMap'),
			name: 'PCIMap',
			meta: { 
				title: '查核地圖', 
				roles: ['distress.inspectorMAP'],
				isNew: true 
			}
		}
	]
}
export default caseRouter