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
		// {
		// 	path: 'kit',
		// 	component: () => import('@/views/dispatch/kit'),
		// 	name: 'kit',
		// 	meta: {
		// 		title: '計價套組',
		// 		roles: ['beta'],
		// 		vTag: 'Alpha'
		// 	}
		// },
		{
			path: 'plan',
			component: () => import('@/views/dispatch/plan'),
			name: 'plan',
			meta: {
				title: '主任派工',
				roles: ['beta'],
				vTag: 'Alpha'
			}
		},
		{
			path: 'jobTicket',
			component: () => import('@/views/dispatch/jobTicket'),
			name: 'jobTicket',
			meta: {
				title: '製作派工單',
				roles: ['beta'],
				vTag: 'Alpha'
			}
		},
		{
			path: 'finRegister',
			component: () => import('@/views/dispatch/finRegister'),
			name: 'finRegister',
			meta: {
				title: '完工登錄',
				roles: ['beta'],
				vTag: 'Alpha'
			}
		}
	]
}
export default dispatchRouter