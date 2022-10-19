import request from '@/utils/request'

export function getRoadUnit(query) {
	return request({
		url: '/road/unit',
		method: 'get',
		params: query
	})
}