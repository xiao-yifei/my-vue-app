const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const REMEMBERED_USERNAME_KEY = 'rememberedUsername'
const REMEMBER_ME_KEY = 'rememberMe'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function getUserInfo() {
  const raw =
    localStorage.getItem(USER_INFO_KEY) || sessionStorage.getItem(USER_INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * 登录成功后保存 token 与用户信息
 * @param {Object} options
 * @param {string} options.token
 * @param {Object} options.userInfo
 * @param {boolean} options.remember - 是否“记住我”
 * @param {string} [options.username] - 用于记住用户名（勾选记住我时）
 */
export function setAuth({ token, userInfo, remember, username }) {
  const storage = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage

  other.removeItem(TOKEN_KEY)
  other.removeItem(USER_INFO_KEY)

  if (token) storage.setItem(TOKEN_KEY, token)
  if (userInfo) storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))

  if (remember && username) {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, username)
    localStorage.setItem(REMEMBER_ME_KEY, '1')
  } else {
    localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    localStorage.setItem(REMEMBER_ME_KEY, '0')
  }
}

/** 清除登录态（退出或 401 时调用） */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_INFO_KEY)
}

/** 是否曾勾选过“记住我” */
export function getRememberMe() {
  return localStorage.getItem(REMEMBER_ME_KEY) === '1'
}

/** 上次记住的用户名（用于登录页预填） */
export function getRememberedUsername() {
  return localStorage.getItem(REMEMBERED_USERNAME_KEY) || ''
}
