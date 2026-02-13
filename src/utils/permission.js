/**
 * 权限判断（与后端 role 约定一致）
 * 后端登录/注册返回 user.role：'admin' | 'user'
 */

/**
 * 是否有主题配置（增删改主题）权限，仅 admin 可管理
 * @param {Object|null} userInfo - getUserInfo() 返回值
 * @returns {boolean}
 */
export function canManageThemes(userInfo) {
  return userInfo?.role === 'admin'
}
