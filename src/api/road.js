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

// 鋪面缺失
export function getRoadCaseGeo(query) {
	return request({
		url: '/road/caseGeo',
		method: 'get',
		params: query
	})
}