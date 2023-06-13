import Layout from '@/layout'

const dispatchRouter = {
	path: '/account',
	component: Layout,
	// redirect: '/dispatch/assign',
	name: 'accountManager',
	meta: {
		title: '帳號管理',
		icon: 'clipboard-account-outline',
		roles: ['rAdm'],
		isNew: true
	},
	children: [
		
		{
			path: 'accountList',
			component: () => import('@/views/account/accountList'),
			name: 'accountList',
			meta: {
				title: '帳號列表',
				roles: ['rAdm'],
				isNew: true
			}
		},
	]
}
export default dispatchRouter