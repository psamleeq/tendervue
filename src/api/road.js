import request from '@/utils/request'

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