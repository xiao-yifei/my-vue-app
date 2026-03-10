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

/**
 * 请求重置密码（发送验证码/链接到邮箱）
 * @param {Object} data - { email }
 * @returns {Promise}
 */
export function requestPasswordReset(data) {
  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data,
  })
}

/**
 * 重置密码（使用 token + 新密码）
 * @param {Object} data - { token, password }
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data,
  })
}
