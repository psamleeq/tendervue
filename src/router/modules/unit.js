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
		roles: ['uRoad', 'uBlock'],
		isNew: true
	},
	children: [
		{
			path: 'roadUnit',
			component: () => import('@/views/unit/roadUnit'),
			name: 'roadUnit',
			meta: { 
				title: '道路單元',
				roles: ['uRoad.viewer', 'uBlock.manager'],
				isNew: true
			}
		},
		{
			path: 'genLaneMap',
			component: () => import('@/views/unit/genLaneMap'),
			name: 'genLaneMap',
			meta: {
				title: '車道單元產生',
				roles: ['uBlock.manager'],
				isNew: true
			}
		},
		{
			path: 'laneUnit',
			component: () => import('@/views/unit/laneUnit'),
			name: 'laneUnit',
			meta: {
				title: '車道單元',
				roles: ['uRoad.viewer', 'uBlock.manager'],
				isNew: true
			}
		},
		{
			path: 'genBlockMap',
			component: () => import('@/views/unit/genBlockMap'),
			name: 'genBlockMap',
			meta: { 
				title: '維護單元產生', 
				roles: ['uBlock.manager'],
				isNew: true
			}
		}
	]
}
export default unitRouter