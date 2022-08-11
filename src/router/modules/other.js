/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const otherRouter = {
    path: '/other',
    component: Layout,
    redirect: '/case/createRoom',
    name: 'case',
    meta: {
      title: '其他報表',
			icon: 'el-icon-info',
      isNew: true 
    },
    children: [
			{
				path: 'precipitation',
				component: () => import('@/views/other/precipitation'),
				name: 'precipitation',
				meta: { title: '每月降雨天數', isNew: true }
			}
    ]
  }
export default otherRouter