/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const inspectionRouter = {
	path: '/inspection',
	component: Layout,
	redirect: '/inspection/inspectionProgress',
	name: 'inspection',
	meta: {
		title: '巡查管理',
		icon: 'map-marker-path',
		roles: ['inspection'],
		isNew: true 
	},
	children: [
		{
			path: 'caseInspectionRoute',
			component: () => import('@/views/inspection/caseInspectionRoute'),
			name: 'caseInspectionRoute',
			meta: {
				title: '巡查路線',
				roles: ['inspection.editor'],
				isNew: true
			}
		},
		{
			path: 'inspectionProgress',
			component: () => import('@/views/inspection/inspectionProgress'),
			name: 'inspectionProgress',
			meta: {
				title: '巡查歷程',
				roles: ['inspection.viewer'],
				isNew: true
			}
		},
		{
			path: 'caseMark',
			component: () => import('@/views/inspection/caseMark'),
			name: 'caseMark',
			meta: {
				title: '缺失標記',
				roles: ['inspection.marker'],
				isNew: true
			}
		},
		{
			path: 'caseMarkList',
			component: () => import('@/views/inspection/caseMarkList'),
			name: 'caseMarkList',
			meta: {
				title: '標記列表',
				roles: ['inspection.marker'],
				isNew: true
			}
		}
		,
		{
			path: 'caseTrackingList',
			component: () => import('@/views/inspection/caseTrackingList'),
			name: 'caseTrackingList',
			meta: {
				title: '追蹤列表',
				roles: ['inspection.marker'],
				isNew: true
			}
		}
	]
}
export default inspectionRouter