/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const caseListRouter = {
	path: '/caseList',
	component: Layout,
	redirect: '/PI/precipitation',
	name: 'PIIndex',
	meta: {
		title: '案件紀錄',
		icon: 'el-icon-suitcase',
		roles: ['case']
	},
	children: [
		{
			path: 'inspection',
			component: () => import('@/views/caseList/inspection'),
			name: 'inspection',
			meta: { 
				title: '分派紀錄', 
				roles: ['case.viewer'],
			}
		},
		{
			path: 'finish',
			component: () => import('@/views/caseList/finish'),
			name: 'finish',
			meta: { 
				title: '完工紀錄', 
				roles: ['case.viewer']
			}
		},
	]
}
export default caseListRouter