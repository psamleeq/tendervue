import request from '@/utils/request';

export function getCaseReport(query) {
	return request({
		url: '/case/caseReport',
		method: 'get',
		params: query
	})
}