import request from '@/api/request.js'

/**
 * 获取所有主题（发现区列表）
 * @returns {Promise<Array>}
 */
export function getThemes() {
  return request({
    url: '/themes',
    method: 'get',
  })
}

/**
 * 根据 id 获取单个主题（主题页详情与图集）
 * @param {string} id - 主题 id
 * @returns {Promise<Object>}
 */
export function getThemeById(id) {
  return request({
    url: `/themes/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

/**
 * 创建主题
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
 * 更新主题（全量）
 * @param {string} id - 主题 id
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
 * 删除主题
 * @param {string} id - 主题 id
 * @returns {Promise<Object>}
 */
export function deleteTheme(id) {
  return request({
    url: `/themes/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
