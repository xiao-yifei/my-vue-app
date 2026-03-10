import request from '@/api/request.js'

export function getComments(targetType, targetId) {
  return request({
    url: '/comments',
    method: 'get',
    params: { targetType, targetId },
  })
}

/**
 * 获取当前用户发表的评论列表（含目标标题）
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
export function getMyComments(limit = 50) {
  return request({
    url: '/comments/my',
    method: 'get',
    params: { limit },
  })
}

export function createComment(targetType, targetId, content, parentId) {
  return request({
    url: '/comments',
    method: 'post',
    data: { targetType, targetId, content, parentId },
  })
}

export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete',
  })
}

export function likeComment(id) {
  return request({
    url: `/comments/${id}/like`,
    method: 'post',
  })
}
