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