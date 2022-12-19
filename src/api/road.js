import request from '@/utils/request'

// 單元管理
export function getRoadUnit(query) {
	return request({
		url: '/road/unit',
		method: 'get',
		params: query
	})
}

export function getRoadUnitGeo(query) {
	return request({
		url: '/road/unitGeo',
		method: 'get',
		params: query
	})
}

export function setLaneUnitGeo(data) {
	return request({
		url: '/road/unitLane',
		method: 'post',
		data
	})
}

export function getLaneUnit(query) {
	return request({
		url: '/road/unitLane',
		method: 'get',
		params: query
	})
}

export function getLaneUnitGeo(query) {
	return request({
		url: '/road/unitLaneGeo',
		method: 'get',
		params: query
	})
}

export function setLaneBlockGeo(data) {
	return request({
		url: '/road/unitLaneBlock',
		method: 'post',
		data
	})
}

export function setRoadBlockGeo(data) {
	return request({
		url: '/road/unitRoadBlock',
		method: 'post',
		data
	})
}

export function getBlockUnit(query) {
	return request({
		url: '/road/unitBlock',
		method: 'get',
		params: query
	})
}

export function setBlockUnit(id, data) {
	return request({
		url: `/road/unitBlock/${id}`,
		method: 'put',
		data
	})
}

// 缺失管理
export function getRoadCaseType(query) {
	return request({
		url: '/road/caseType',
		method: 'get',
		params: query
	})
}

export function getRoadCaseList(query) {
	return request({
		url: '/road/caseList',
		method: 'get',
		params: query
	})
}

export function setRoadCase(id, data) {
	return request({
		url: `/road/caseList/${id}`,
		method: 'put',
		data
	})
}

export function getRoadCaseGeo(query) {
	return request({
		url: '/road/caseGeo',
		method: 'get',
		params: query
	})
}

//路況查詢
export function getRoadStatus(query) {
	return request({
		url: '/road/status',
		method: 'get',
		params: query
	})
}

// PCI地圖
export function getPCIBlock(query) {
	return request({
		url: '/road/PCIBlock',
		method: 'get',
		params: query
	})
}
