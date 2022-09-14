import request from '@/utils/request';

export function getCaseList(query) {
	return request({
		url: '/PI/caseList',
		method: 'get',
		params: query
	})
}