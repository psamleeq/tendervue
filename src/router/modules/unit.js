/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const unitRouter = {
	path: '/unit',
	component: Layout,
	redirect: '/unit/list',
	name: 'unit',
	meta: {
		title: '單元管理',
		icon: 'road', 
		roles: ['uRoad.viewer', 'uBlock.manager'],
		isNew: true
	},
	children: [
		{
			path: 'list',
			component: () => import('@/views/unit/list'),
			name: 'list',
			meta: { 
				title: '道路單元',
				roles: ['uRoad.viewer', 'uBlock.manager'],
				isNew: true
			}
		},
		{
			path: 'genMap',
			component: () => import('@/views/unit/genMap'),
			name: 'genMap',
			meta: { 
				title: '維護單元產生', 
				roles: ['uBlock.manager'],
				isNew: true
			}
		}
	]
}
export default unitRouter