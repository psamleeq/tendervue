import request from '@/utils/request'

// 車巡管理
export function getInspectionList(query) {
	return request({
		url: '/inspections',
		method: 'get',
		params: query
	})
}

export function getSpecInspection(id, query) {
	return request({
		url: `/inspections/${id}`,
		method: 'get',
		params: query
	})
}

export function getSpecInspectionTracks(id, query) {
	return request({
		url: `/inspections/${id}/carGpsTracks`,
		method: 'get',
		params: query
	})
}

// 巡視案件
export function getInspectionCase(query) {
	return request({
		url: '/car/insCases',
		method: 'get',
		params: query
	})
}

// 巡視分案
export function setInspectionCase(data) {
	return request({
		url: '/car/insCases',
		method: 'post',
		data
	})
}

// 巡視案件刪除
export function delInspectionCase(data) {
	return request({
		url: '/car/insCases',
		method: 'delete',
		data
	})
}

// 巡視歷程
export function getCaseListLog(query) {
	return request({
		url: '/car/caseLog',
		method: 'get',
		params: query
	})
}

// 巡視歷程 - 匯入csv
export function importCaseListLog(data) {
	return request({
		url: '/car/caseLog',
		method: 'post',
		data
	})
}