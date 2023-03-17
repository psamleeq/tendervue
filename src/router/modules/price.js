/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dispatchRouter = {
	path: '/price',
	component: Layout,
	// redirect: '/dispatch/assign',
	name: 'price',
	meta: {
		title: '計價管理',
		icon: 'clipboard-account-outline',
		roles: ['restored'],
		isNew: true
	},
	children: [
		
		{
			path: 'priceManage',
			component: () => import('@/views/price/price'),
			name: 'priceManage',
			meta: {
				title: '計價管理',
				roles: ['restored.viewer'],
				isNew: true
			}
		},
	]
}
export default dispatchRouter