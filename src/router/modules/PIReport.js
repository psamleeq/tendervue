/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const PIReportRouter = {
	path: '/PIReport',
	component: Layout,
	redirect: 'noRedirect',
	name: 'PIReport',
	meta: {
		title: '成效報表',
		icon: 'el-icon-document',
		roles: ['PIreport'],
		isNew: true
	},
	children: [
		{
			path: 'daily',
			component: {
				render: (c) => c('router-view')
			},
			name: 'daily',
			redirect: '/PIReport/daily/list',
			meta: { 
				title: '日報表', 
				roles: ['PIreport'],
				isNew: true
			},
			children: [
				{
					path: 'list',
					component: () => import('@/views/PIReport/daily/list'),
					name: 'list',
					meta: { 
						title: '日報表', 
						roles: ['PIreport.daily'],
						isNew: true
					}
				},
				{
					path: 'edit',
					component: () => import('@/views/PIReport/daily/edit'),
					name: 'edit',
					meta: { 
						title: '日報表編輯', 
						roles: ['PIreport.daily']
					},
					hidden: true
				},
				{
					path: 'PI2_1',
					component: () => import('@/views/PIReport/daily/PI2_1'),
					name: 'PI2_1',
					meta: { 
						title: 'PI2.1', 
						roles: ['PIreport.daily']
					},
					hidden: true
				},
				{
					path: 'PI2_1_Att',
					component: () => import('@/views/PIReport/daily/PI2_1_Att'),
					name: 'PI2_1_Att',
					meta: { 
						title: 'PI2.1附件', 
						roles: ['PIreport.daily'] 
					},
					hidden: true
				},
				{
					path: 'PI2_1_Att_2',
					component: () => import('@/views/PIReport/daily/PI2_1_Att_2'),
					name: 'PI2_1_Att_2',
					meta: { 
						title: 'PI2.1附件-2', 
						roles: ['PIreport.daily']
					},
					hidden: true
				},
				{
					path: 'PI3_1',
					component: () => import('@/views/PIReport/daily/PI3_1'),
					name: 'PI3_1',
					meta: {
						title: 'PI3.1',
						roles: ['PIreport.daily']
					},
					hidden: true
				},
				{
					path: 'PI3_1_Att',
					component: () => import('@/views/PIReport/daily/PI3_1_Att'),
					name: 'PI3_1_Att',
					meta: {
						title: 'PI3.1附件',
						roles: ['PIreport.daily']
					},
					hidden: true
				}
			]
		},
		{
			path: 'weekly',
			component: {
				render: (c) => c('router-view')
			},
			name: 'weekly',
			redirect: 'noRedirect',
			meta: {
				title: '週報表',
				roles: ['PIreport'],
				vTag: 'Alpha'
			},
			children: [
				{
					path: 'PI2_2',
					component: () => import('@/views/PIReport/weekly/PI2_2'),
					name: 'PI2_2',
					meta: {
						title: 'PI2.2',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					}
				},
				{
					path: 'PI2_2_Att',
					component: () => import('@/views/PIReport/weekly/PI2_2_Att'),
					name: 'PI2_2_Att',
					meta: {
						title: 'PI2.2附件',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					},
				},
				{
					path: 'PI2_2_Att_2',
					component: () => import('@/views/PIReport/weekly/PI2_2_Att_2'),
					name: 'PI2_2_Att_2',
					meta: {
						title: 'PI2.2附件-2',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					},
				},
				{
					path: 'PI2_2_Att_3',
					component: () => import('@/views/PIReport/weekly/PI2_2_Att_3'),
					name: 'PI2_2_Att_3',
					meta: {
						title: 'PI2.2附件-3',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					},
				},
				{
					path: 'PI3_2',
					component: () => import('@/views/PIReport/weekly/PI3_2'),
					name: 'PI3_2',
					meta: {
						title: 'PI3.2',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					}
				},
				{
					path: 'PI4_1',
					component: () => import('@/views/PIReport/weekly/PI4_1'),
					name: 'PI4_1',
					meta: {
						title: 'PI4.1',
						roles: ['PIreport.weekly'],
						vTag: 'Alpha'
					}
				},
			]
		},
	]
}
export default PIReportRouter