<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout as logoutApi } from '@/api'
import { clearAuth, getUserInfo } from '@/utils/auth.js'
import { canManageThemes } from '@/utils/permission.js'
import HomeGallery from '@/pages/Home/HomeGallery.vue'
import HomeTopBar from '@/pages/Home/HomeTopBar.vue'

const DISCOVERY_STATE_KEY = 'homeDiscoveryState'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const noPermissionHint = ref(false)
const loggingOut = ref(false)
const homeMainRef = ref(null)
const searchQuery = ref('')
const savedScrollTop = ref(0)

onMounted(() => {
  user.value = getUserInfo()
  if (route.query.message === 'noPermission') {
    noPermissionHint.value = true
    router.replace({ path: '/home', query: {} })
    setTimeout(() => { noPermissionHint.value = false }, 4000)
  }
  try {
    const raw = sessionStorage.getItem(DISCOVERY_STATE_KEY)
    if (raw) {
      const { scrollTop = 0, searchQuery: q = '' } = JSON.parse(raw)
      searchQuery.value = q
      if (scrollTop > 0) savedScrollTop.value = scrollTop
    }
  } catch {
    // ignore
  }
})

function onGalleryReady() {
  if (savedScrollTop.value > 0 && homeMainRef.value) {
    nextTick(() => {
      if (homeMainRef.value) {
        homeMainRef.value.scrollTop = savedScrollTop.value
        savedScrollTop.value = 0
      }
    })
  }
}

onBeforeUnmount(() => {
  try {
    const scrollTop = homeMainRef.value?.scrollTop ?? 0
    sessionStorage.setItem(
      DISCOVERY_STATE_KEY,
      JSON.stringify({ scrollTop, searchQuery: searchQuery.value })
    )
  } catch {
    // ignore
  }
})

const displayName = computed(() => {
  if (!user.value) return '用户'
  return user.value.username ?? user.value.name ?? user.value.email ?? '用户'
})

const displayEmail = computed(() => user.value?.email ?? '—')

const showThemeConfig = computed(() => canManageThemes(user.value))

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logoutApi()
    ElMessage.success('已退出登录')
  } catch {
    // 接口失败也继续清理本地并跳转
    ElMessage.warning('退出登录')
  } finally {
    clearAuth()
    loggingOut.value = false
    router.push('/login')
  }
}
</script>

<template>
  <div class="home-page">
    <div class="home-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <HomeTopBar
      :display-name="displayName"
      :display-email="displayEmail"
      :show-theme-config="showThemeConfig"
      :logging-out="loggingOut"
      @logout="logout"
    />

    <p v-if="noPermissionHint" class="permission-hint">无权限访问该页面，仅管理员可管理主题配置。</p>
    <main ref="homeMainRef" class="home-main">
      <div class="home-card">
        <HomeGallery v-model:search-query="searchQuery" @ready="onGalleryReady" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
}

.home-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.shape {
  position: absolute;
  border-radius: 50%;
  /* 降低模糊度以提升性能，或使用 will-change 提示浏览器优化 */
  filter: blur(60px);
  opacity: 0.4;
  will-change: transform;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--accent);
  top: -120px;
  right: -80px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -60px;
  left: -60px;
}

.permission-hint {
  position: relative;
  z-index: 5;
  margin: 0;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}

.home-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  /* 启用硬件加速和滚动优化 */
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.home-card {
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
  background: var(--card-bg);
  border: none;
  border-radius: 0;
  /* 移除 backdrop-filter 以提升滚动性能 */
  box-shadow: none;
}
</style>
