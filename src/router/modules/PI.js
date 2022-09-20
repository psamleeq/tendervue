/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const otherRouter = {
	path: '/PIIndex',
	component: Layout,
	redirect: '/PI/precipitation',
	name: 'PIIndex',
	meta: {
		title: '成效指標',
		icon: 'el-icon-s-check',
		isNew: true
	},
	children: [
		{
			path: 'caseList',
			component: () => import('@/views/PI/caseList'),
			name: 'PICaseList',
			meta: { title: '案件列表', isNew: true }
		},
		{
			path: 'caseUpload',
			component: () => import('@/views/PI/caseUpload'),
			name: 'caseUpload',
			meta: { title: '案件上傳', isNew: true }
		},
	]
}
export default otherRouter