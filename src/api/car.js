import request from '@/utils/request'

export function getInspectionList(query) {
	return request({
		url: '/inspections',
		method: 'get',
		baseURL: process.env.VUE_APP_BASE_API_CAR,
		params: query
	})
}

export function getSpecInspection(id, query) {
	return request({
		url: `/inspections/${id}`,
		method: 'get',
		baseURL: process.env.VUE_APP_BASE_API_CAR,
		params: query
	})
}

export function getSpecInspectionTracks(id, query) {
	return request({
		url: `/inspections/${id}/carGpsTracks`,
		method: 'get',
		baseURL: process.env.VUE_APP_BASE_API_CAR,
		params: query
	})
}