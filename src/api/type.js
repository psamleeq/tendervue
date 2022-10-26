import request from '@/utils/request'

// 合約Map
export function getDteamMap(query) {
	return request({
		url: '/type/dteamMap',
		method: 'get',
		params: query
	})
}

// 類型Map
export function getTypeMap(query) {
	return request({
		url: '/type/caseTypeMap',
		method: 'get',
		params: query
	})
}

// 類型Map
export function getKitItemMap(query) {
	return request({
		url: '/type/kitItemMap',
		method: 'get',
		params: query
	})
}