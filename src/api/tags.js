import request from '@/api/request.js'

/**
 * 获取全站标签列表（聚合自文章与视频）
 * @returns {Promise<string[]>}
 */
export function getTags() {
  return request({
    url: '/tags',
    method: 'get',
  })
}
