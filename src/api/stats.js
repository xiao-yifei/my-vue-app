import request from '@/api/request.js'

export function getStats() {
  return request({
    url: '/stats',
    method: 'get',
  })
}
