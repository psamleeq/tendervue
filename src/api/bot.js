import request from '@/utils/request'

export function getbotlist(query) {
    return request({
        url: '/bot/list',
        method: 'get',
        params: query
    })
}

export function adjustBotAssets(data) {
    return request({
        url: '/bot/adjustassets',
        method: 'post',
        data
    })
}

export function dailyReportBot(query) {
    return request({
        url: '/bot/daily',
        method: 'get',
        params: query
    })
}

export function dailyWinLose(query) {
    return request({
        url: '/bot/winlose',
        method: 'get',
        params: query
    })
}

export function getGuildTable(query) {
    return request({
        url: '/bot/createRoom',
        method: 'get',
        params: query
    })
}

export function openGuildTable(data) {
    return request({
        url: '/bot/createRoom',
        method: 'post',
        data
    })
}