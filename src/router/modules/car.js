/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const carRouter = {
	path: '/car',
	component: Layout,
	redirect: '/car/route',
	name: 'car',
	meta: {
		title: '道路巡視',
		icon: 'el-icon-truck',
		roles: ['car']
	},
	children: [
		{
			path: 'route',
			component: () => import('@/views/car/route'),
			name: 'carRoute',
			meta: {
				title: '巡視路線',
				roles: ['car.route']
			}
		},
		{
			path: 'classification',
			component: () => import('@/views/car/classification'),
			name: 'caseClassification',
			meta: {
				title: '巡視分案',
				roles: ['car.route'],
				isNew: true
			}
		},
		{
			path: 'monitor',
			component: () => import('@/views/car/monitor'),
			name: 'carMonitor',
			meta: {
				title: '巡視影像',
				roles: ['car.viewer']
			}
		}
	]
}
export default carRouter