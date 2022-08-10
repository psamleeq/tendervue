import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/signin',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/auth/check',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export function changePassword(data) {
  return request({
    url: '/auth/changePassed',
    method: 'post',
    data
  })
}