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
		roles: ['restored'],
		isNew: true
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
				roles: ['restored.assign'],
				isNew: true
			}
		},
		{
			path: 'jobTicket',
			component: () => import('@/views/dispatch/jobTicket'),
			name: 'jobTicket',
			meta: {
				title: '製作派工單',
				roles: ['restored.order'],
				isNew: true
			}
		},
		{
			path: 'jobTicketEdit',
			component: () => import('@/views/dispatch/jobTicketEdit'),
			name: 'jobTicketEdit',
			meta: {
				title: '修改派工單',
				roles: ['restored.viewer']
			},
			hidden: true
		},
		{
			path: 'finRegister',
			component: () => import('@/views/dispatch/finRegister'),
			name: 'finRegister',
			meta: {
				title: '完工登錄',
				roles: ['restored.reporter'],
				isNew: true
			}
		},
		{
			path: 'jobTicketManage',
			component: () => import('@/views/dispatch/jobTicketManage'),
			name: 'jobTicketManage',
			meta: {
				title: '派工單管理',
				roles: ['restored.viewer'],
				isNew: true
			}
		},
	]
}
export default dispatchRouter