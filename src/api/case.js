import request from '@/utils/request';

// 維護案件
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

// 交辦案件金額
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

// 經費金額
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

// 經費預估
export function getCostEstimate(query) {
	return request({
		url: '/case/costEstimate',
		method: 'get',
		params: query
	})
}

export function setCostEstimate(data) {
	return request({
		url: '/case/costEstimate',
		method: 'post',
		data
	})
}

export function delCostEstimate(id, data) {
	return request({
		url: `/case/costEstimate/${id}`,
		method: 'delete',
		data
	})
}

// 巡查數量
export function getInspectCase(query) {
	return request({
		url: '/case/inspectCase',
		method: 'get',
		params: query
	})
}