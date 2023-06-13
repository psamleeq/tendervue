import request from '@/utils/request'

//帳號列表
export function getAccountList(query) {
	return request({
		url: '/auth/accountList',
		method: 'get',
		params: query
	})
}

//帳號新增
export function addAcount(data) {
	return request({
		url: '/auth/account',
		method: 'post',
		data
	})
}

//帳號停用啟用
export function changeActive(data) {
	return request({
		url: '/auth/active',
		method: 'post',
		data
	})
}