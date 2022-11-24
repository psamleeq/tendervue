/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const PCIRouter = {
		path: '/PCI',
		component: Layout,
		redirect: '/PCI/report',
		name: 'PCI',
		meta: {
			title: 'PCI數據',
			icon: 'el-icon-s-marketing',
			roles: ['PCIanalyst']
		},
		children: [
			{
				path: 'report',
				component: () => import('@/views/PCI/report'),
				name: 'report',
				meta: { 
					title: '報表',
					roles: ['PCIanalyst.viewer']
				}
			},
			{
				path: 'trend',
				component: () => import('@/views/PCI/trend'),
				name: 'trend',
				meta: { 
					title: '趨勢圖',
					roles: ['PCIanalyst.viewer']
				}
			},
			{
				path: 'average',
				component: () => import('@/views/PCI/average'),
				name: 'average',
				meta: { 
					title: 'PCI平均',
					roles: ['PCIanalyst.viewer']
				}
			},
			{
				path: 'share',
				component: () => import('@/views/PCI/share'),
				name: 'share',
				meta: { 
					title: '每月份額',
					roles: ['PCIanalyst.viewer']
				}
			},
			{
				path: 'caseReport',
				component: () => import('@/views/PCI/caseReport'),
				name: 'caseReport',
				meta: { 
					title: '派工和PCI分析', 
					roles: ['PCIanalyst.viewer'] 
				}
			}
		]
	}
	export default PCIRouter