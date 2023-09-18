import request from '@/utils/request'

export function getInspectFinList(query) {
	return request({
		url: '/app/inspectFinList',
		method: 'get',
		params: query
	})
}

export function setInspectFinList(id, data) {
	return request({
		url: `/app/inspectFinList/${id}`,
		method: 'put',
		data
	})
}

export function trackingImgUpload(data) {
	return request({
		url: '/app/trackingImgUpload',
		method: 'post',
		data
	})
}