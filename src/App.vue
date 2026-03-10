<script setup>
import TopBar from '@/components/TopBar.vue'
import { useTheme } from '@/composables/useTheme.js'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { theme } = useTheme()

watch(
  theme,
  (v) => {
    if (v === 'light') {
      document.documentElement.classList.add('app-theme-light')
    } else {
      document.documentElement.classList.remove('app-theme-light')
    }
  },
  { immediate: true }
)
const showTopBar = computed(() => {
  const p = route.path
  const hidePaths = ['/login', '/register', '/forgot-password', '/reset-password']
  return !hidePaths.includes(p)
})
const themeClass = computed(() => (theme.value === 'light' ? 'theme-light' : ''))
</script>

<template>
  <div class="app-root" :class="themeClass">
    <TopBar v-if="showTopBar" />
    <div class="app-content">
      <router-view v-slot="{ Component }">
        <keep-alive
          :exclude="[
            'Login',
            'Register',
            'ForgotPassword',
            'ResetPassword',
            'GalleryDetail',
            'ArticleDetail',
            'VideoDetail',
          ]"
        >
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>

<style>
.app-root.theme-light .app-content {
  background: #f1f5f9;
}
.app-root.theme-light .top-bar {
  background: rgba(248, 250, 252, 0.98);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.app-root.theme-light [class$="-page"],
.app-root.theme-light [class*="-page "] {
  --text: #1e293b;
  --text-muted: #64748b;
  --card-bg: rgba(0, 0, 0, 0.04);
  --card-border: rgba(0, 0, 0, 0.08);
}
.app-root.theme-light [class$="-bg"],
.app-root.theme-light .shape {
  opacity: 0.15;
}
.app-root.theme-light .terms-bg,
.app-root.theme-light .privacy-bg,
.app-root.theme-light .home-bg,
.app-root.theme-light .articles-bg,
.app-root.theme-light .videos-bg,
.app-root.theme-light .gallery-bg,
.app-root.theme-light .detail-bg,
.app-root.theme-light .theme-bg,
.app-root.theme-light .history-bg,
.app-root.theme-light .search-bg,
.app-root.theme-light .favorites-bg,
.app-root.theme-light .profile-bg,
.app-root.theme-light .about-bg,
.app-root.theme-light .notif-bg,
.app-root.theme-light .my-comments-bg,
.app-root.theme-light .config-bg,
.app-root.theme-light .stats-bg {
  background: #e2e8f0 !important;
}
.app-root.theme-light .top-bar-title,
.app-root.theme-light .top-bar-link,
.app-root.theme-light .user-name,
.app-root.theme-light .manage-trigger {
  color: #334155;
}
.app-root.theme-light .user-email,
.app-root.theme-light .dropdown-item {
  color: #64748b;
}
.app-root.theme-light .dropdown-item:hover,
.app-root.theme-light .dropdown-item.is-active,
.app-root.theme-light .top-bar-link.is-active,
.app-root.theme-light .top-bar-title.is-active {
  color: var(--accent);
}
.app-root.theme-light .user-dropdown-menu,
.app-root.theme-light .manage-dropdown-menu {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(0, 0, 0, 0.1);
}
.app-root.theme-light .btn-logout {
  color: #64748b;
  border-color: rgba(0, 0, 0, 0.15);
}
.app-root.theme-light .btn-logout:hover:not(:disabled) {
  color: #334155;
  border-color: rgba(0, 0, 0, 0.25);
}

/* 明亮主题下搜索框样式 */
.app-root.theme-light .search-input,
.app-root.theme-light .home-search-input {
  background: #fff !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}
.app-root.theme-light .search-input::placeholder,
.app-root.theme-light .home-search-input::placeholder {
  color: #94a3b8 !important;
}
.app-root.theme-light .search-input:focus,
.app-root.theme-light .home-search-input:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}
.app-root.theme-light .home-search-item:hover {
  background: rgba(0, 0, 0, 0.04) !important;
  border-color: var(--accent);
}

/* 登录 / 注册 / 忘记密码 / 重置密码 明亮主题 */
.app-root.theme-light .login-bg,
.app-root.theme-light .register-bg {
  background:
    linear-gradient(135deg, rgba(226, 232, 240, 0.75) 0%, rgba(241, 245, 249, 0.85) 50%, rgba(226, 232, 240, 0.8) 100%),
    url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=85') center/cover no-repeat !important;
}
.app-root.theme-light .forgot-bg,
.app-root.theme-light .reset-bg {
  background: #e2e8f0 !important;
}
.app-root.theme-light .login-page .shape,
.app-root.theme-light .register-page .shape,
.app-root.theme-light .forgot-page .shape,
.app-root.theme-light .reset-page .shape {
  opacity: 0.15;
}
.app-root.theme-light .login-card,
.app-root.theme-light .register-card,
.app-root.theme-light .forgot-card,
.app-root.theme-light .reset-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
}
.app-root.theme-light .login-page .field input,
.app-root.theme-light .register-page .field input,
.app-root.theme-light .forgot-page .field input,
.app-root.theme-light .reset-page .field input {
  background: #fff !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}
.app-root.theme-light .login-page .field input::placeholder,
.app-root.theme-light .register-page .field input::placeholder,
.app-root.theme-light .forgot-page .field input::placeholder,
.app-root.theme-light .reset-page .field input::placeholder {
  color: #94a3b8 !important;
}
.app-root.theme-light .login-page .field input:focus,
.app-root.theme-light .register-page .field input:focus,
.app-root.theme-light .forgot-page .field input:focus,
.app-root.theme-light .reset-page .field input:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
}
.app-root.theme-light .login-page .field label,
.app-root.theme-light .register-page .field label,
.app-root.theme-light .login-page .checkbox-wrap,
.app-root.theme-light .register-page .checkbox-wrap,
.app-root.theme-light .forgot-page .field label,
.app-root.theme-light .reset-page .field label {
  color: #64748b !important;
}
.app-root.theme-light .login-page .checkmark,
.app-root.theme-light .register-page .checkmark {
  border-color: #cbd5e1 !important;
}
.app-root.theme-light .login-page .signup-hint,
.app-root.theme-light .register-page .login-hint,
.app-root.theme-light .forgot-page .back-hint,
.app-root.theme-light .reset-page .back-hint,
.app-root.theme-light .forgot-page .success-hint {
  color: #64748b !important;
}

/* 通知页面明亮主题 */
.app-root.theme-light .notifications-page .notif-item {
  background: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
}
.app-root.theme-light .notifications-page .notif-item.unread {
  background: rgba(13, 148, 136, 0.08) !important;
  border-color: rgba(13, 148, 136, 0.2) !important;
}
.app-root.theme-light .notifications-page .btn-mark-all {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
