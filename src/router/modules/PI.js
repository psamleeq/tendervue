/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const otherRouter = {
	path: '/PIIndex',
	component: Layout,
	redirect: '/PI/precipitation',
	name: 'PIIndex',
	meta: {
		title: '成效指標',
		icon: 'el-icon-s-check'
	},
	children: [
		{
			path: 'caseList',
			component: () => import('@/views/PI/caseList'),
			name: 'caseList',
			meta: { title: '案件列表' }
		},
	]
}
export default otherRouter