import request from '@/utils/request'

// 套組列表
export function getCostKit(query) {
	return request({
		url: '/cost/kit',
		method: 'get',
		params: query
	})
}

// 套組細項
export function getCostKitDetail(query) {
	return request({
		url: '/cost/kitDetail',
		method: 'get',
		params: query
	})
}