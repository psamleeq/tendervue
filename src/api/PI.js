import request from '@/utils/request';

// 成效指標 - 案件稽核
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

export function delCaseList(id, data) {
	return request({
		url: `/PI/caseList/${id}`,
		method: 'delete',
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

export function getCheckResult(query) {
	return request({
		url: 'PI/checkResult',
		method: 'get',
		params: query
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

// PI4.2: 保固案件列表
export function getCaseWarrantyList(query) {
	return request({
		url: 'PI/caseWarrantyList',
		method: 'get',
		params: query
	})
}

export function addCaseWarrantyList(data) {
	return request({
		url: 'PI/caseWarrantyList',
		method: 'post',
		data
	})
}