/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const roadRouter = {
	path: '/road',
	component: Layout,
	redirect: '/road/unit',
	name: 'road',
	meta: {
		title: '道路管理',
		icon: 'road', 
		vTag: 'Alpha'
	},
	children: [
		{
			path: 'unit',
			component: () => import('@/views/road/unit'),
			name: 'unit',
			meta: { title: '道路單元', vTag: 'Alpha' }
		},
		{
			path: 'unitGen',
			component: () => import('@/views/road/unitGen'),
			name: 'unitGen',
			meta: { title: '維護單元產生', vTag: 'Alpha' }
		}
	]
}
export default roadRouter