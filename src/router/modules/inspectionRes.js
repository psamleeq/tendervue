/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const inspectionRouter = {
	path: '/inspectionRes',
	component: Layout,
	redirect: '/inspection/inspectionProgress',
	name: 'inspectionRes',
	meta: {
		title: '環巡成果',
		icon: 'el-icon-s-marketing',
		roles: ['inspection'],
		isNew: true 
	},
	children: [
		{
			path: 'caseInspectionMap',
			component: () => import('@/views/inspectionRes/caseInspectionMap'),
			name: 'caseInspectionMap',
			meta: {
				title: '案件地圖',
				roles: ['inspection.viewer'],
			}
		},
		{
			path: 'caseTrackingList',
			component: () => import('@/views/inspectionRes/caseTrackingList'),
			name: 'caseTrackingList',
			meta: {
				title: '案件列表',
				roles: ['inspection.editor'],
				isNew: true
			}
		},
		{
			path: 'caseTrackingStatic',
			component: () => import('@/views/inspectionRes/caseTrackingStatic'),
			name: 'caseTrackingStatic',
			meta: {
				title: '回報分析',
				roles: ['inspection.viewer'],
				isNew: true
			}
		}
	]
}
export default inspectionRouter