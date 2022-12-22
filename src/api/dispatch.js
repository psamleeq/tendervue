import request from '@/utils/request'

// 套組列表
export function getCostKitV0(query) {
	return request({
		url: '/dispatchV0/kit',
		method: 'get',
		params: query
	})
}

// 套組細項
export function getCostKitDetailV0(query) {
	return request({
		url: '/dispatchV0/kitDetail',
		method: 'get',
		params: query
	})
}

// 主任派工列表
export function getDispatchListV0(query) {
	return request({
		url: '/dispatchV0/list',
		method: 'get',
		params: query
	})
}

export function getDispatchList(query) {
	return request({
		url: '/dispatch/list',
		method: 'get',
		params: query
	})
}

// 廠商派工單列表
export function getJobTicketV0(query) {
	return request({
		url: '/dispatchV0/jobTicket',
		method: 'get',
		params: query
	})
}