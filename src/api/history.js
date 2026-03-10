import request from '@/api/request.js'

export function getHistory(limit = 50) {
  return request({
    url: '/history',
    method: 'get',
    params: { limit },
  })
}

export function addHistory(targetType, targetId, target = {}) {
  return request({
    url: '/history',
    method: 'post',
    data: { targetType, targetId, target },
  })
}

export function removeHistory(id) {
  return request({
    url: `/history/${id}`,
    method: 'delete',
  })
}

export function clearHistory() {
  return request({
    url: '/history',
    method: 'delete',
  })
}
