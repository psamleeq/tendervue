import request from '@/utils/request';

export function getPCIList(query) {
	return request({
		url: '/pci/list',
		method: 'get',
		params: query
	})
}