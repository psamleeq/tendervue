import request from '@/utils/request';

// 成效指標 - 案件列表
export function getCaseList(query) {
	return request({
		url: '/PI/caseList',
		method: 'get',
		params: query
	})
}

export function addCaseList(data) {
	return request({
		url: '/PI/caseList',
		method: 'post',
		data
	})
}

export function setCaseList(id, data) {
	return request({
		url: `/PI/caseList/${id}`,
		method: 'put',
		data
	})
}

export function archiveCaseList(data) {
	return request({
		url: `/PI/caseList`,
		method: 'put',
		data
	})
}

// 成效指標報表
export function getCaseCount(query) {
	return request({
		url: 'PI/caseCount',
		method: 'get',
		params: query
	})
}