import request from '@/utils/request'

// 區域Geo
export function getDistGeo(query) {
	return request({
		url: '/type/unitZip',
		method: 'get',
		params: query
	})
}

// 施工廠商Map
export function getWClassMap(query) {
	return request({
		url: '/type/workClass',
		method: 'get',
		params: query
	})
}

// 合約Map
export function getTenderMap(query) {
	return request({
		url: '/type/tenderMap',
		method: 'get',
		params: query
	})
}

// 合約區域
export function getTenderBlock(query) {
	return request({
		url: '/type/tenderBlock',
		method: 'get',
		params: query
	})
}

// 合約區間
export function getTenderRound(query) {
	return request({
		url: '/type/tenderRound',
		method: 'get',
		params: query
	})
}

export function setTenderRound(id, data) {
	return request({
		url: `/type/tenderRound/${id}`,
		method: 'put',
		data
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