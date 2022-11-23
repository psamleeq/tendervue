/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const carRouter = {
	path: '/car',
	component: Layout,
	redirect: '/car/route',
	name: 'car',
	meta: {
		title: '車管系統',
		icon: 'el-icon-truck',
		roles: ['beta'],
		isNew: true 
	},
	children: [
		{
			path: 'route',
			component: () => import('@/views/car/route'),
			name: 'car_1',
			meta: { 
				title: '車巡管理',
				roles: ['beta']
			}
		}
	]
}
export default carRouter