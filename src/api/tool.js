import request from '@/utils/request';

// 計算PCI
export function resetPCI(data) {
	return request({
		url: '/pciTool/reset',
		method: 'post',
		data
	})
}

export function updatePCI(data) {
	return request({
		url: '/pciTool/update',
		method: 'put',
		data
	})
}

export function updatePCIByName(data) {
	return request({
		url: '/pciTool/updateByName',
		method: 'put',
		data
	})
}