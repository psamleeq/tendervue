import request from '@/utils/request';

export function getCaseReport(query) {
	return request({
		url: '/case/caseReport',
		method: 'get',
		params: query
	})
}

export function getCaseList(query) {
	return request({
		url: '/case/caseList',
		method: 'get',
		params: query
	})
}

export function getAssignCaseAmt(query) {
	return request({
		url: '/case/assignCaseAmt',
		method: 'get',
		params: query
	})
}

export function setAssignCaseAmt(data) {
	return request({
		url: '/case/assignCaseAmt',
		method: 'post',
		data
	})
}

export function delAssignCaseAmt(id, data) {
	return request({
		url: `/case/assignCaseAmt/${id}`,
		method: 'delete',
		data
	})
}

export function getExpenseAmt(query) {
	return request({
		url: '/case/expenseAmt',
		method: 'get',
		params: query
	})
}

export function setExpenseAmt(data) {
	return request({
		url: '/case/expenseAmt',
		method: 'post',
		data
	})
}

export function delExpenseAmt(id, data) {
	return request({
		url: `/case/expenseAmt/${id}`,
		method: 'delete',
		data
	})
}

export function getInspectCase(query) {
	return request({
		url: '/case/inspectCase',
		method: 'get',
		params: query
	})
}