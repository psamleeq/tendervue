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
		roles: ['distress']
	},
	children: [
		{
			path: 'caseUpload',
			component: () => import('@/views/case/caseUpload'),
			name: 'caseUpload',
			meta: {
				title: '缺失上傳',
				roles: ['distress.inspectorMaster'],
				isNew: true
			}
		},
		{
			path: 'caseList',
			component: () => import('@/views/case/list'),
			name: 'caseList',
			meta: { 
				title: '缺失列表', 
				roles: ['distress.viewer']
			}
		},
		{
			path: 'caseMap',
			component: () => import('@/views/case/caseMap'),
			name: 'caseMap',
			meta: { 
				title: '缺失地圖', 
				roles: ['distress.viewer']
			}
		},
		{
			path: 'roadStatus',
			component: () => import('@/views/case/roadStatus'),
			name: 'roadStatus',
			meta: { 
				title: '路況查詢', 
				roles: ['distress.inspector']
			}
		},
		{
			path: 'PCIManager',
			component: () => import('@/views/case/PCIManager'),
			name: 'PCIManager',
			meta: {
				title: 'PCI管理',
				roles: ['distress.inspectorMaster']
			}
		},
		{
			path: 'PCIMap',
			component: () => import('@/views/case/PCIMap'),
			name: 'PCIMap',
			meta: { 
				title: '查核地圖', 
				roles: ['distress.inspectorMAP']
			}
		}
	]
}
export default caseRouter