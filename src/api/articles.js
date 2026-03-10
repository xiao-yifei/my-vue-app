import request from '@/api/request.js'

/**
 * 获取文章列表
 * @returns {Promise<Array>}
 */
export function getArticles() {
  return request({
    url: '/articles',
    method: 'get',
  })
}

/**
 * 根据 id 获取单篇文章
 * @param {string} id - 文章 id
 * @returns {Promise<Object>}
 */
export function getArticleById(id) {
  return request({
    url: `/articles/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

/**
 * 创建文章
 * @param {Object} data - { title, excerpt?, content, cover?, status? }
 * @returns {Promise<Object>}
 */
export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data,
  })
}

/**
 * 更新文章
 * @param {string} id - 文章 id
 * @param {Object} data - { title, excerpt?, content, cover?, status? }
 * @returns {Promise<Object>}
 */
export function updateArticle(id, data) {
  return request({
    url: `/articles/${encodeURIComponent(id)}`,
    method: 'put',
    data,
  })
}

/**
 * 删除文章
 * @param {string} id - 文章 id
 * @returns {Promise<void>}
 */
export function deleteArticle(id) {
  return request({
    url: `/articles/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
