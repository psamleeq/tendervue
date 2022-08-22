import request from '@/utils/request';

export function getPCIList(query) {
	return request({
		url: '/pci/list',
		method: 'get',
		params: query
	})
}

export function getPCIShare(query) {
	return request({
		url: '/pci/share',
		method: 'get',
		params: query
	})
}

export function getPCIAverage(query) {
	return request({
		url: '/pci/average',
		method: 'get',
		params: query
	})
}

export function getCaseAndPCI(query) {
	return request({
		url: '/pci/caseReport',
		method: 'get',
		params: query
	})
}