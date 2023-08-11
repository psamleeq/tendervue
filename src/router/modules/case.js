/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseRouter = {
	path: '/case',
	component: Layout,
	redirect: '/case/caseList',
	name: 'road',
	meta: {
		title: '鋪面管理',
		icon: 'el-icon-s-release', 
		roles: ['distress'],
		vTag: 'Alpha'
	},
	children: [
		{
			path: 'caseUpload',
			component: () => import('@/views/case/caseUpload'),
			name: 'caseUpload',
			meta: {
				title: '缺失上傳',
				roles: ['distress.inspectorMaster'],
				vTag: 'Alpha'
			}
		},
		{
			path: 'caseList',
			component: () => import('@/views/case/list'),
			name: 'caseList',
			meta: { 
				title: '缺失列表', 
				roles: ['distress.viewer'],
				vTag: 'Alpha'
			}
		},
		{
			path: 'caseMap',
			component: () => import('@/views/case/caseMap'),
			name: 'caseMap',
			meta: { 
				title: '缺失地圖', 
				roles: ['distress.viewer'],
				vTag: 'Alpha'
			}
		},
		{
			path: 'PCIMap',
			component: () => import('@/views/case/PCIMap'),
			name: 'PCIMap',
			meta: { 
				title: '查核地圖', 
				roles: ['distress.inspectorOrtho'],
				vTag: 'Alpha'
			}
		}
	]
}
export default caseRouter