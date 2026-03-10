import request from '@/api/request.js'

/**
 * 更新当前用户资料（昵称、头像等）
 * @param {Object} data - { nickname?, avatar? }
 */
export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'patch',
    data,
  })
}

/**
 * 修改密码
 * @param {Object} data - { oldPassword, newPassword }
 */
export function changePassword(data) {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data,
  })
}
