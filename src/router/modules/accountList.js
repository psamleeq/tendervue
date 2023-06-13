import Layout from '@/layout'

const dispatchRouter = {
	path: '/accountList',
	component: Layout,
	// redirect: '/dispatch/assign',
	name: 'accountList',
	meta: {
		title: '帳號列表',
		icon: 'clipboard-account-outline',
		roles: ['beta'],
		isNew: true
	},
	children: [
		
		{
			path: 'accountList',
			component: () => import('@/views/accountList/accountList'),
			name: 'accountList',
			meta: {
				title: '帳號列表',
				roles: ['beta'],
				isNew: true
			}
		},
	]
}
export default dispatchRouter