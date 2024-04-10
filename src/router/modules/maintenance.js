/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const maintenanceRouter = {
	path: '/maintenance',
	component: Layout,
	redirect: 'noRedirect',
	name: 'maintenance',
	meta: {
		title: '鋪面養護',
		icon: 'clipboard-account-outline',
		roles: ['restored', 'Pricing'],
		isNew: true
	},
	children: [
		{
			path: 'apply',
			component: {
				render: (c) => c('router-view')
			},
			name: 'apply',
			redirect: 'noRedirect',
			meta: {
				title: '養護通報',
				roles: ['restored.assign']
			},
			children: [
				{
					path: 'caseApplyManage',
					component: () => import('@/views/dispatch/caseApplyManage'),
					name: 'caseApplyManage',
					meta: {
						title: '通報單管理',
						roles: ['restored.assign'],
						vTag: 'alpha'
					}
				},
				{
					path: 'caseApply',
					component: () => import('@/views/dispatch/caseApply'),
					name: 'caseApply',
					meta: {
						title: '製作通報單',
						roles: ['restored.assign'],
						vTag: 'alpha'
					}
				},
				{
					path: 'applyReview',
					component: () => import('@/views/dispatch/applyReview'),
					name: 'applyReview',
					meta: {
						title: '分工判核',
						roles: ['restored.assign'],
						vTag: 'alpha'
					}
				},
			]
		},
		{
			path: 'job',
			component: {
				render: (c) => c('router-view')
			},
			name: 'job',
			redirect: 'noRedirect',
			meta: {
				title: '養護施作',
				roles: ['restored.assign', 'restored.order', 'restored.reporter', 'restored.viewer']
			},
			children: [
				{
					path: 'plan',
					component: () => import('@/views/dispatch/plan'),
					name: 'plan',
					meta: {
						title: '施作分派',
						roles: ['restored.assign'],
						isNew: true
					}
				},
				{
					path: 'jobReview',
					component: () => import('@/views/dispatch/jobReview'),
					name: 'jobReview',
					meta: {
						title: '派工審核',
						roles: ['restored.order'],
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
						roles: ['restored.order']
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
				}
			]
		},
		{
			path: 'price',
			component: {
				render: (c) => c('router-view')
			},
			name: 'price',
			redirect: 'noRedirect',
			alwaysShow: true,
			meta: {
				title: '養護費用',
				roles: ['Pricing.viewer']
			},
			children: [
				{
					path: 'priceManage',
					component: () => import('@/views/price/price'),
					name: 'priceManage',
					meta: {
						title: '計價管理',
						roles: ['Pricing.viewer'],
						isNew: true
					}
				}
			]
		}
	]
}
export default maintenanceRouter