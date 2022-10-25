import request from '@/utils/request'

// 類型Map
export function getTypeMap(query) {
	return request({
		url: '/type/caseTypeMap',
		method: 'get',
		params: query
	})
}