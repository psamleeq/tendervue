import request from '@/utils/request'

// 即時資料
export function getAppStats(query) {
  return request({
    url: '/game/getAppStats',
    method: 'get',
    params: query
  })
}

export function getAppPList(query) {
  return request({
    url: '/game/getAppPList',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(麻將)
export function getGameHist(query) {
  return request({
    url: '/game/gameHist',
    method: 'get',
    params: query
  })
}

export function getGameHistDetail(query) {
  return request({
    url: '/game/gameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(麻將-新)
export function getMJGameHist(query) {
  return request({
    url: '/game/MJGameHist',
    method: 'get',
    params: query
  })
}

export function getMJGameHistDetail(query) {
  return request({
    url: '/game/MJGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(妞妞)
export function getNieuGameHist(query) {
  return request({
    url: '/game/NieuGameHist',
    method: 'get',
    params: query
  })
}

export function getNieuGameHistDetail(query) {
  return request({
    url: '/game/NieuGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(吹牛)
export function getBoastGameHist(query) {
  return request({
    url: '/game/BoastGameHist',
    method: 'get',
    params: query
  })
}

export function getBoastGameHistDetail(query) {
  return request({
    url: '/game/BoastGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(搶莊妞妞)
export function getBullfightGameHist(query) {
  return request({
    url: '/game/BullfightGameHist',
    method: 'get',
    params: query
  })
}

export function getBullfightGameHistDetail(query) {
  return request({
    url: '/game/BullfightGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(21點)
export function getBlackjackGameHist(query) {
  return request({
    url: '/game/BlackjackGameHist',
    method: 'get',
    params: query
  })
}

export function getBlackjackGameHistDetail(query) {
  return request({
    url: '/game/BlackjackGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(老虎機)
export function getSlotGameHist(query) {
  return request({
    url: '/game/SlotGameHist',
    method: 'get',
    params: query
  })
}

export function getSlotGameHistDetail(query) {
  return request({
    url: '/game/SlotGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(13支)
export function getCPGameHist(query) {
  return request({
    url: '/game/CPGameHist',
    method: 'get',
    params: query
  })
}

export function getCPGameHistDetail(query) {
  return request({
    url: '/game/CPGameDetail',
    method: 'get',
    params: query
  })
}

// 遊戲歷程(百家樂)
export function getBacGameHist(query) {
  return request({
    url: '/game/BacGameHist',
    method: 'get',
    params: query
  })
}

export function getBacGameInning(query) {
  return request({
    url: '/game/BacGameInning',
    method: 'get',
    params: query
  })
}

export function getBacGameDetail(query) {
  return request({
    url: '/game/BacGameDetail',
    method: 'get',
    params: query
  })
}

// 同桌率
export function getPlayTogether(query) {
  return request({
    url: '/game/playTogether',
    method: 'get',
    params: query
  })
}

// 輸贏統計
export function getScoreStat(query) {
  return request({
    url: '/game/scoreStat',
    method: 'get',
    params: query
  })
}

// 老虎機platform
export function getSlotPlatform(query) {
  return request({
    url: '/game/slotPlatform',
    method: 'get',
    params: query
  })
}

export function addSlotPlatform(data) {
  return request({
    url: '/game/slotPlatform',
    method: 'post',
    data
  })
}

export function changeSlotPlatform(id, data) {
  return request({
    url: `/game/slotPlatform/${id}`,
    method: 'put',
    data
  })
}

// 老虎機卡錢處理
export function getStuckPlayer(query) {
  return request({ 
    url: '/game/stuckPlayer',
    method: 'get',
    params: query
  })
}

export function getBetLastLog(query) {
  return request({
    url: '/game/betLastLog',
    method: 'get',
    params: query
  })
}

export function returnSlotBal(data) {
  return request({
    url: '/game/returnSlotBal',
    method: 'post',
    data
  })
}