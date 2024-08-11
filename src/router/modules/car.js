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
			path: 'inspectionRoute',
			component: () => import('@/views/car/caseInspectionRoute'),
			name: 'inspectionRoute',
			meta: {
				title: '巡查路線(計畫)',
				roles: ['car.marker']
			}
		},
		{
			path: 'route',
			component: () => import('@/views/car/route'),
			name: 'carRoute',
			meta: {
				title: '巡視路線(車輛)',
				roles: ['car.viewer']
			}
		},
		{
			path: 'routeMap',
			component: () => import('@/views/car/routeMap'),
			name: 'carRouteMap',
			meta: {
				title: '巡視路線(分隊)',
				roles: ['car.viewer']
			}
		},
		{
			path: 'classification',
			component: () => import('@/views/car/classification'),
			name: 'caseClassification',
			meta: {
				title: '巡視分案',
				roles: ['car.route'],
				vTag: 'alpha'
			}
		},
		{
			path: 'carCaseList',
			component: () => import('@/views/car/carCaseList'),
			name: 'carCaseList',
			meta: {
				title: '巡視判核',
				roles: ['car.route'],
				vTag: 'alpha'
			}
		},
		// {
		// 	path: 'caseListLog',
		// 	component: () => import('@/views/car/caseListLog'),
		// 	name: 'caseListLog',
		// 	meta: {
		// 		title: '1999匯入',
		// 		roles: ['car.route'],
		// 		vTag: 'alpha'
		// 	}
		// },
		{
			path: 'pothole',
			component: () => import('@/views/car/pothole'),
			name: 'pothole',
			meta: {
				title: '坑洞缺失',
				roles: ['car.viewer'],
				vTag: 'alpha'
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