import request from '@/api/request.js'

/**
 * 获取图库列表
 * @returns {Promise<Array>}
 */
export function getThemes() {
  return request({
    url: '/themes',
    method: 'get',
  })
}

/**
 * 根据 id 获取图库详情（含图集）
 * @param {string} id - 图库 id
 * @returns {Promise<Object>}
 */
export function getThemeById(id) {
  return request({
    url: `/themes/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

/**
 * 创建图库
 * @param {Object} data - { id, label, large?, ratio?, src?, alt?, images? }
 * @returns {Promise<Object>}
 */
export function createTheme(data) {
  return request({
    url: '/themes',
    method: 'post',
    data,
  })
}

/**
 * 更新图库（全量）
 * @param {string} id - 图库 id
 * @param {Object} data - { label, large?, ratio?, src?, alt?, images? }
 * @returns {Promise<Object>}
 */
export function updateTheme(id, data) {
  return request({
    url: `/themes/${encodeURIComponent(id)}`,
    method: 'put',
    data,
  })
}

/**
 * 删除图库
 * @param {string} id - 图库 id
 * @returns {Promise<Object>}
 */
export function deleteTheme(id) {
  return request({
    url: `/themes/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
