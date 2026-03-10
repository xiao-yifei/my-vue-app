import request from '@/api/request.js'

/**
 * 获取视频列表
 * @returns {Promise<Array>}
 */
export function getVideos() {
  return request({
    url: '/videos',
    method: 'get',
  })
}

/**
 * 根据 id 获取单个视频
 * @param {string} id - 视频 id
 * @returns {Promise<Object>}
 */
export function getVideoById(id) {
  return request({
    url: `/videos/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

/**
 * 创建视频
 * @param {Object} data - { title, excerpt?, cover?, src }
 * @returns {Promise<Object>}
 */
export function createVideo(data) {
  return request({
    url: '/videos',
    method: 'post',
    data,
  })
}

/**
 * 更新视频
 * @param {string} id - 视频 id
 * @param {Object} data - { title, excerpt?, cover?, src }
 * @returns {Promise<Object>}
 */
export function updateVideo(id, data) {
  return request({
    url: `/videos/${encodeURIComponent(id)}`,
    method: 'put',
    data,
  })
}

/**
 * 删除视频
 * @param {string} id - 视频 id
 * @returns {Promise<void>}
 */
export function deleteVideo(id) {
  return request({
    url: `/videos/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
