<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme.js'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout as logoutApi, getUnreadCount } from '@/api'
import { clearAuth, getToken, getUserInfo } from '@/utils/auth.js'
import { canManageThemes, canManageArticles, canManageVideos } from '@/utils/permission.js'

const route = useRoute()
const router = useRouter()
const user = ref(null)

const isHomeActive = computed(() => route.path === '/home')
const isArticlesActive = computed(() =>
  route.path === '/articles' || route.path.startsWith('/article/')
)
const isThemesActive = computed(() =>
  route.path === '/themes' || route.path.startsWith('/theme/')
)
const isVideosActive = computed(() =>
  route.path === '/videos' || route.path.startsWith('/video/')
)
const isThemeConfigActive = computed(() => route.path === '/theme-config')
const isArticleConfigActive = computed(() => route.path === '/article-config')
const isVideoConfigActive = computed(() => route.path === '/video-config')
const isBannerConfigActive = computed(() => route.path === '/banner-config')
const isStatsActive = computed(() => route.path === '/stats')
const isManageActive = computed(() =>
  ['/theme-config', '/article-config', '/video-config', '/banner-config', '/stats'].includes(route.path)
)
const isNotificationsActive = computed(() => route.path === '/notifications')
const isHistoryActive = computed(() => route.path === '/history')
const isMyCommentsActive = computed(() => route.path === '/my-comments')
const isSearchActive = computed(() => route.path === '/search')
const isFavoritesActive = computed(() => route.path === '/favorites')
const isProfileActive = computed(() => route.path === '/profile')
const isAboutActive = computed(() => route.path === '/about')
const unreadCount = ref(0)
const loggingOut = ref(false)
const { theme, toggleTheme } = useTheme()

async function fetchUnread() {
  if (!getToken()) return
  try {
    const data = await getUnreadCount()
    unreadCount.value = data?.count ?? 0
  } catch {
    unreadCount.value = 0
  }
}

onMounted(() => {
  user.value = getUserInfo()
  fetchUnread()
})

watch(
  () => route.path,
  () => {
    if (route.path === '/notifications') fetchUnread()
  }
)

const displayName = computed(() => {
  if (!user.value) return '用户'
  return user.value.username ?? user.value.name ?? user.value.email ?? '用户'
})

const displayEmail = computed(() => user.value?.email ?? '—')

const showThemeConfig = computed(() => canManageThemes(user.value))

const showArticleConfig = computed(() => canManageArticles(user.value))
const showVideoConfig = computed(() => canManageVideos(user.value))

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logoutApi()
    ElMessage.success('已退出登录')
  } catch {
    ElMessage.warning('退出登录')
  } finally {
    clearAuth()
    loggingOut.value = false
    router.push('/login')
  }
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <router-link to="/home" class="top-bar-title" :class="{ 'is-active': isHomeActive }">首页</router-link>
      <router-link to="/articles" class="top-bar-link" :class="{ 'is-active': isArticlesActive }">文章</router-link>
      <router-link to="/themes" class="top-bar-link" :class="{ 'is-active': isThemesActive }">图库</router-link>
      <router-link to="/videos" class="top-bar-link" :class="{ 'is-active': isVideosActive }">视频</router-link>
      <router-link to="/search" class="top-bar-link" :class="{ 'is-active': isSearchActive }">搜索</router-link>
      <div v-if="showThemeConfig" class="manage-dropdown">
        <span class="manage-trigger" :class="{ 'is-active': isManageActive }">
          管理 ▾
        </span>
        <div class="manage-dropdown-menu">
          <router-link to="/theme-config" class="dropdown-item" :class="{ 'is-active': isThemeConfigActive }">
            图库配置
          </router-link>
          <router-link v-if="showArticleConfig" to="/article-config" class="dropdown-item" :class="{ 'is-active': isArticleConfigActive }">
            文章配置
          </router-link>
          <router-link v-if="showVideoConfig" to="/video-config" class="dropdown-item" :class="{ 'is-active': isVideoConfigActive }">
            视频配置
          </router-link>
          <router-link to="/banner-config" class="dropdown-item" :class="{ 'is-active': isBannerConfigActive }">
            轮播配置
          </router-link>
          <router-link to="/stats" class="dropdown-item" :class="{ 'is-active': isStatsActive }">
            数据统计
          </router-link>
        </div>
      </div>
    </div>
    <div class="top-bar-right">
      <button
        type="button"
        class="btn-theme"
        :title="theme === 'dark' ? '切换浅色' : '切换深色'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀' : '🌙' }}
      </button>
      <div class="user-dropdown">
        <div class="user-info-bar">
          <div class="avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
          <div class="user-meta">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-email">{{ displayEmail }}</span>
          </div>
        </div>
        <div class="user-dropdown-menu">
          <router-link to="/history" class="dropdown-item" :class="{ 'is-active': isHistoryActive }">
            <span class="dropdown-icon">📜</span>
            浏览历史
          </router-link>
          <router-link to="/my-comments" class="dropdown-item" :class="{ 'is-active': isMyCommentsActive }">
            <span class="dropdown-icon">💬</span>
            我的评论
          </router-link>
          <router-link to="/favorites" class="dropdown-item" :class="{ 'is-active': isFavoritesActive }">
            <span class="dropdown-icon">⭐</span>
            我的收藏
          </router-link>
          <router-link to="/notifications" class="dropdown-item" :class="{ 'is-active': isNotificationsActive }">
            <span class="dropdown-icon">🔔</span>
            通知
            <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
          <router-link to="/profile" class="dropdown-item" :class="{ 'is-active': isProfileActive }">
            <span class="dropdown-icon">⚙</span>
            个人设置
          </router-link>
          <router-link to="/about" class="dropdown-item" :class="{ 'is-active': isAboutActive }">
            <span class="dropdown-icon">ℹ</span>
            关于
          </router-link>
        </div>
      </div>
      <button type="button" class="btn-logout" :disabled="loggingOut" @click="logout">
        {{ loggingOut ? '退出中…' : '退出登录' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid var(--card-border);
  backdrop-filter: blur(10px);
  transform: translateZ(0);
}

.top-bar-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.top-bar-link {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.top-bar-link:hover {
  color: var(--accent);
}

.top-bar-icon-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.35rem 0.5rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.top-bar-icon-link:hover,
.top-bar-icon-link.is-active {
  color: var(--accent);
}
.icon-bell {
  display: block;
}
.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  background: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-bar-link.is-active,
.top-bar-title.is-active {
  color: var(--accent);
}

.manage-dropdown {
  position: relative;
}
.manage-dropdown:hover .manage-dropdown-menu {
  opacity: 1;
  visibility: visible;
}
.manage-trigger {
  display: inline-block;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}
.manage-trigger:hover,
.manage-trigger.is-active {
  color: var(--accent);
}
.manage-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  min-width: 140px;
  padding: 0.5rem 0;
  background: rgba(30, 41, 59, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
}

.top-bar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
  text-decoration: none;
  transition: color 0.2s;
}

.top-bar-title:hover {
  color: var(--accent);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}
.btn-theme {
  padding: 0.4rem 0.5rem;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.btn-theme:hover {
  color: var(--accent);
  background: rgba(255, 255, 255, 0.08);
}

.user-dropdown {
  position: relative;
}
.user-dropdown:hover .user-dropdown-menu {
  opacity: 1;
  visibility: visible;
}
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  min-width: 160px;
  padding: 0.5rem 0;
  background: rgba(30, 41, 59, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  position: relative;
}
.dropdown-item:hover,
.dropdown-item.is-active {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.1);
}
.dropdown-icon {
  font-size: 1rem;
}
.dropdown-item .unread-badge {
  margin-left: auto;
  position: static;
  flex-shrink: 0;
}

.user-info-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.user-info-bar .avatar {
  width: 36px;
  height: 36px;
  font-size: 1rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-logout {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-logout:hover:not(:disabled) {
  color: var(--text);
  border-color: rgba(148, 163, 184, 0.5);
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
