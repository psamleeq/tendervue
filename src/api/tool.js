import request from '@/utils/request';

// 計算PCI
export function calPCI(data) {
	return request({
		url: '/tool/PCI',
		method: 'post',
		data
	})
}