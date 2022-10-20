import request from '@/utils/request';

// 類型Map
export function getTypeMap(query) {
	return request({
		url: '/PI/caseTypeMap',
		method: 'get',
		params: query
	})
}

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