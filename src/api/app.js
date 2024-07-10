import request from '@/utils/request'

export function getInspectFlowList(query) {
	return request({
		url: '/app/inspectFlowList',
		method: 'get',
		params: query
	})
}

export function setInspectFlowList(id, data) {
	return request({
		url: `/app/inspectFlowList/${id}`,
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

// 坑洞回報
export function getInspectFlowPotholeList(query) {
	return request({
		url: '/app/inspectFlowPotholeList',
		method: 'get',
		params: query
	})
}

// 建立案件
export function importPotholeCase(data) {
	return request({
		url: '/app/importCase',
		method: 'post',
		data
	})
}

export function restoredImgUpload(data) {
	return request({
		url: '/app/restoredImgUpload',
		method: 'post',
		data
	})
}