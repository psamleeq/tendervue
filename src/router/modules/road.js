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
		isNew: true 
	},
	children: [
		{
			path: 'unit',
			component: () => import('@/views/road/unit'),
			name: 'unit',
			meta: { title: '道路單元', isNew: true }
		}
	]
}
export default roadRouter