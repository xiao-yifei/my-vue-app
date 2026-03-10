import request from '@/api/request.js'

/**
 * 获取当前用户收藏列表
 * @returns {Promise<Array>} 收藏项 { id, targetType, targetId, target?, createdAt }
 */
export function getFavorites() {
  return request({
    url: '/favorites',
    method: 'get',
  })
}

/**
 * 添加收藏
 * @param {string} targetType - article | video
 * @param {string|number} targetId
 * @param {Object} [target] - { title, cover } 用于列表展示
 */
export function addFavorite(targetType, targetId, target = {}) {
  return request({
    url: '/favorites',
    method: 'post',
    data: { targetType, targetId, target },
  })
}

/**
 * 取消收藏
 * @param {string|number} id - 收藏记录 id
 */
export function removeFavorite(id) {
  return request({
    url: `/favorites/${id}`,
    method: 'delete',
  })
}

/**
 * 检查某内容是否已收藏（若后端支持）
 * @param {string} targetType
 * @param {string|number} targetId
 */
export function checkFavorite(targetType, targetId) {
  return request({
    url: '/favorites/check',
    method: 'get',
    params: { targetType, targetId },
  }).catch(() => ({ favorited: false }))
}
