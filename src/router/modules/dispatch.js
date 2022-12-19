/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dispatchRouter = {
	path: '/dispatch',
	component: Layout,
	redirect: '/dispatch/assign',
	name: 'dispatch',
	meta: {
		title: '派工管理',
		icon: 'clipboard-account-outline',
		roles: ['beta'],
		vTag: 'Alpha'
	},
	children: [
		{
			path: 'kit',
			component: () => import('@/views/dispatch/kit'),
			name: 'kit',
			meta: { 
				title: '計價套組', 
				roles: ['beta'],
				vTag: 'Alpha' 
			}
		},
		{
			path: 'assign',
			component: () => import('@/views/dispatch/assign'),
			name: 'assign',
			meta: {
				title: '主任派工',
				roles: ['beta'],
				vTag: 'Alpha'
			}
		}
	]
}
export default dispatchRouter