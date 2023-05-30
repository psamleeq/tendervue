import request from '@/utils/request'

// 缺失標記
export function uploadInspectionCase(data) {
	return request({
		url: '/inspection/caseUpload',
		method: 'post',
		data
	})
}