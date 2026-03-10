/**
 * 权限判断（与后端 role 约定一致）
 * 后端登录/注册返回 user.role：'admin' | 'user'
 */

/**
 * 是否有图库配置（增删改图库）权限，仅 admin 可管理
 * @param {Object|null} userInfo - getUserInfo() 返回值
 * @returns {boolean}
 */
export function canManageThemes(userInfo) {
  return userInfo?.role === 'admin'
}

/**
 * 是否有文章配置（增删改文章）权限，仅 admin 可管理
 * @param {Object|null} userInfo - getUserInfo() 返回值
 * @returns {boolean}
 */
export function canManageArticles(userInfo) {
  return userInfo?.role === 'admin'
}

/**
 * 是否有视频配置（增删改视频）权限，仅 admin 可管理
 * @param {Object|null} userInfo - getUserInfo() 返回值
 * @returns {boolean}
 */
export function canManageVideos(userInfo) {
  return userInfo?.role === 'admin'
}
