import request from '@/utils/request'

// 缺失標記
export function getPanoramaJson(query) {
	return request({
		url: '/inspection/panoramaJson',
		method: 'get',
		params: query
	})
}

export function getInspectGeoJson(query) {
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