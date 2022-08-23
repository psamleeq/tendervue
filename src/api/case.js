import request from '@/utils/request';

export function getCaseReport(query) {
	return request({
		url: '/case/caseReport',
		method: 'get',
		params: query
	})
}

export function getInspectCase(query) {
	return request({
		url: '/case/inspectCase',
		method: 'get',
		params: query
	})
}