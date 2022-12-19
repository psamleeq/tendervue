import request from '@/utils/request'

// 區域Geo
export function getDistGeo(query) {
	return request({
		url: '/type/unitZip',
		method: 'get',
		params: query
	})
}

// 合約Map
export function getWClassMap(query) {
	return request({
		url: '/type/workClass',
		method: 'get',
		params: query
	})
}

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