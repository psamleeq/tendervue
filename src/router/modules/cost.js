/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const roadRouter = {
	path: '/cost',
	component: Layout,
	redirect: '/cost/kit',
	name: 'cost',
	meta: {
		title: '計價管理',
		icon: 'el-icon-money'
	},
	children: [
		{
			path: 'kit',
			component: () => import('@/views/cost/kit'),
			name: 'kit',
			meta: { title: '計價套組', vTag: 'Alpha' }
		}
	]
}
export default roadRouter