import request from '@/api/request.js'

/**
 * 用户登录
 * @param {Object} data - { username, password, remember? }
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

/**
 * 用户注册
 * @param {Object} data - { username, email, password }
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
  })
}

/**
 * 退出登录（通知服务端使 token 失效，可选）
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}
