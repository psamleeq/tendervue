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
			path: 'kitV0',
			component: () => import('@/views/dispatch/kit_rm100'),
			name: 'kitV0',
			meta: { 
				title: '計價套組_V0', 
				roles: ['beta'],
				vTag: 'Alpha' 
			}
		},
		{
			path: 'planV0',
			component: () => import('@/views/dispatch/plan_rm100'),
			name: 'planV0',
			meta: {
				title: '主任派工_V0',
				roles: ['beta'],
				vTag: 'Alpha'
			}
		},
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
			path: 'jobTicketV0',
			component: () => import('@/views/dispatch/jobTicket_rm100'),
			name: 'jobTicketV0',
			meta: {
				title: '製作派工單_V0',
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
			path: 'finRegisterV0',
			component: () => import('@/views/dispatch/finRegister_rm100'),
			name: 'finRegisterV0',
			meta: {
				title: '完工登錄_V0',
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