/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const inspectionRouter = {
	path: '/inspection',
	component: Layout,
	redirect: '/car/route',
	name: 'car',
	meta: {
		title: '巡查管理',
		icon: 'map-marker-path',
		roles: ['inspection'],
		isNew: true 
	},
	children: [
		{
			path: 'inspectionProgress',
			component: () => import('@/views/inspection/inspectionProgress'),
			name: 'inspectionProgress',
			meta: {
				title: '巡查歷程',
				roles: ['inspection.viewer'],
				vTag: 'alpha'
			}
		},
		{
			path: 'caseMark',
			component: () => import('@/views/inspection/caseMark'),
			name: 'caseMark',
			meta: {
				title: '缺失標記',
				roles: ['inspection.marker'],
				vTag: 'alpha'
			}
		},
		{
			path: 'list',
			component: () => import('@/views/inspection/list'),
			name: 'list',
			meta: {
				title: '缺失列表',
				roles: ['inspection.viewer'],
				vTag: 'alpha'
			}
		},
		{
			path: 'listEdit',
			component: () => import('@/views/inspection/listEdit'),
			name: 'listEdit',
			meta: {
				title: '缺失通報',
				roles: ['inspection.viewer'],
				vTag: 'alpha'
			}
		},
	]
}
export default inspectionRouter