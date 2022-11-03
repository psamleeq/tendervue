/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseRouter = {
	path: '/case',
	component: Layout,
	redirect: '/case/list',
	name: 'road',
	meta: {
		title: '缺失管理',
		icon: 'road', 
		vTag: 'Alpha'
	},
	children: [
		{
			path: 'caseList',
			component: () => import('@/views/case/list'),
			name: 'caseList',
			meta: { title: '缺失列表', vTag: 'Alpha' }
		},
		{
			path: 'caseMap',
			component: () => import('@/views/case/map'),
			name: 'caseMap',
			meta: { title: '缺失地圖', vTag: 'Alpha' }
		}
	]
}
export default caseRouter