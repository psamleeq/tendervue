import request from '@/utils/request'

// 巡查歷程
export function getInspectionList(query) {
	return request({
		url: '/inspection/list',
		method: 'get',
		params: query
	})
}
export function setInspectionList(id, data) {
	return request({
		url: `/inspection/list/${id}`,
		method: 'put',
		data
	})
}

// 缺失標記
export function getPanoramaJson(query) {
	return request({
		url: '/inspection/panoramaJson',
		method: 'get',
		params: query
	})
}

export function getInspectionCaseGeoJson(query) {
	return request({
		url: '/inspection/caseGeoJson',
		method: 'get',
		params: query
	})
}

export function uploadInspectionCase(data) {
	return request({
		url: '/inspection/caseUpload',
		method: 'post',
		data
	})
}

// 標記列表
export function getInspectionCaseList(query) {
	return request({
		url: '/inspection/caseList',
		method: 'get',
		params: query
	})
}

export function importInspectionCase(data) {
	return request({
		url: '/inspection/caseImport',
		method: 'post',
		data
	})
}