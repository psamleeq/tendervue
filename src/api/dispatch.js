import request from '@/utils/request'

// 案件詳細
export function getCaseDetailV0(query) {
	return request({
		url: '/dispatchV0/detail',
		method: 'get',
		params: query
	})
}

// 套組列表
export function getCostKitV0(query) {
	return request({
		url: '/dispatchV0/kit',
		method: 'get',
		params: query
	})
}

// 套組細項

// 主任派工列表
export function getDispatchList(query) {
	return request({
		url: '/dispatch/list',
		method: 'get',
		params: query
	})
}

export function setDispatchList(data) {
	return request({
		url: '/dispatch/list',
		method: 'post',
		data
	})
}

// 廠商派工單列表
export function getJobTicket(query) {
	return request({
		url: '/dispatch/jobTicket',
		method: 'get',
		params: query
	})
}

export function confirmJobTicket(data) {
	return request({
		url: '/dispatch/jobConfirm',
		method: 'post',
		data
	})
}

// 完工登錄列表
export function getFinRegister(query) {
	return request({
		url: '/dispatch/finRegister',
		method: 'get',
		params: query
	})
}

export function finRegisterSpec(data) {
	return request({
		url: `/dispatch/finRegisterSpec`,
		method: 'post',
		data
	})
}

export function finRegister(data) {
	return request({
		url: '/dispatch/finRegister',
		method: 'post',
		data
	})
}