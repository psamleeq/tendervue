import request from '@/utils/request'

// 道路管理
export function getRoadUnit(query) {
	return request({
		url: '/road/unit',
		method: 'get',
		params: query
	})
}

export function getRoadUnitGeo(query) {
	return request({
		url: '/road/unitGeo',
		method: 'get',
		params: query
	})
}

// 缺失管理
export function getRoadCaseType(query) {
	return request({
		url: '/road/caseType',
		method: 'get',
		params: query
	})
}

export function getRoadCaseList(query) {
	return request({
		url: '/road/caseList',
		method: 'get',
		params: query
	})
}

export function setRoadCase(id, data) {
	return request({
		url: `/road/caseList/${id}`,
		method: 'put',
		data
	})
}

export function getRoadCaseGeo(query) {
	return request({
		url: '/road/caseGeo',
		method: 'get',
		params: query
	})
}