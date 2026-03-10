<script setup>
defineOptions({ name: 'Home' })
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBanners, getArticles, getVideos, getThemes } from '@/api'
import BannerCarousel from '@/components/BannerCarousel.vue'

const route = useRoute()
const router = useRouter()
const noPermissionHint = ref(false)
const banners = ref([])
const q = ref((route.query.q || '').trim())
const searchLoading = ref(false)
const searchArticles = ref([])
const searchVideos = ref([])
const searchThemes = ref([])
const searchActiveTab = ref('all')

async function loadBanners() {
  try {
    const data = await getBanners(true)
    banners.value = Array.isArray(data) ? data : []
  } catch {
    banners.value = []
  }
}

async function doSearch() {
  const keyword = q.value.toLowerCase()
  if (!keyword) {
    searchArticles.value = []
    searchVideos.value = []
    searchThemes.value = []
    return
  }
  searchLoading.value = true
  try {
    const [aRes, vRes, tRes] = await Promise.all([
      getArticles(),
      getVideos(),
      getThemes(),
    ])
    const a = Array.isArray(aRes) ? aRes : []
    const v = Array.isArray(vRes) ? vRes : []
    const t = Array.isArray(tRes) ? tRes : []
    const match = (text) => (text || '').toLowerCase().includes(keyword)
    searchArticles.value = a.filter((x) => match(x.title) || match(x.excerpt))
    searchVideos.value = v.filter((x) => match(x.title) || match(x.excerpt))
    searchThemes.value = t.filter((x) => match(x.label) || match(x.id))
  } catch {
    searchArticles.value = []
    searchVideos.value = []
    searchThemes.value = []
  } finally {
    searchLoading.value = false
  }
}

const searchTotalCount = computed(
  () => searchArticles.value.length + searchVideos.value.length + searchThemes.value.length
)
const showSearchArticles = computed(
  () => searchActiveTab.value === 'all' || searchActiveTab.value === 'article'
)
const showSearchVideos = computed(
  () => searchActiveTab.value === 'all' || searchActiveTab.value === 'video'
)
const showSearchThemes = computed(
  () => searchActiveTab.value === 'all' || searchActiveTab.value === 'theme'
)

watch(
  () => route.query.q,
  (v) => {
    if (route.path !== '/home') return
    q.value = (v || '').trim()
    doSearch()
  },
  { immediate: true }
)

function onSearchSubmit() {
  router.replace({ path: '/home', query: q.value ? { q: q.value } : {} })
  doSearch()
}

function goArticle(item) {
  router.push(`/article/${item.id}`)
}
function goVideo(item) {
  router.push(`/video/${item.id}`)
}
function goTheme(item) {
  router.push(`/theme/${item.id}`)
}

loadBanners()

onMounted(() => {
  if (route.query.message === 'noPermission') {
    noPermissionHint.value = true
    router.replace({ path: '/home', query: {} })
    setTimeout(() => { noPermissionHint.value = false }, 4000)
  }
})
</script>

<template>
  <div class="home-page">
    <div class="home-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <p v-if="noPermissionHint" class="permission-hint">无权限访问该页面，仅管理员可管理图库配置。</p>
    <main class="home-main">
      <div class="home-scroll">
        <div class="home-container">
          <BannerCarousel v-if="banners.length" :banners="banners" />
          <section class="home-search">
            <h2 class="home-search-title">搜索</h2>
            <form class="home-search-form" @submit.prevent="onSearchSubmit">
              <input
                v-model="q"
                type="search"
                class="home-search-input"
                placeholder="搜索文章、视频、图库..."
                aria-label="搜索"
              />
              <button type="submit" class="home-search-btn" :disabled="searchLoading">
                {{ searchLoading ? '搜索中…' : '搜索' }}
              </button>
            </form>
            <div v-if="q.trim()" class="home-search-results">
              <div v-if="searchLoading" class="home-search-loading">加载中…</div>
              <template v-else>
                <div class="home-search-tabs">
                  <button
                    type="button"
                    class="home-search-tab"
                    :class="{ active: searchActiveTab === 'all' }"
                    @click="searchActiveTab = 'all'"
                  >
                    全部 ({{ searchTotalCount }})
                  </button>
                  <button
                    type="button"
                    class="home-search-tab"
                    :class="{ active: searchActiveTab === 'article' }"
                    @click="searchActiveTab = 'article'"
                  >
                    文章 ({{ searchArticles.length }})
                  </button>
                  <button
                    type="button"
                    class="home-search-tab"
                    :class="{ active: searchActiveTab === 'video' }"
                    @click="searchActiveTab = 'video'"
                  >
                    视频 ({{ searchVideos.length }})
                  </button>
                  <button
                    type="button"
                    class="home-search-tab"
                    :class="{ active: searchActiveTab === 'theme' }"
                    @click="searchActiveTab = 'theme'"
                  >
                    图库 ({{ searchThemes.length }})
                  </button>
                </div>
                <div v-if="searchTotalCount === 0" class="home-search-empty">
                  未找到与「{{ q }}」相关的内容
                </div>
                <div v-else class="home-search-list">
                  <template v-if="showSearchArticles && searchArticles.length">
                    <h3 class="home-search-section-title">文章</h3>
                    <ul class="home-search-ul">
                      <li
                        v-for="item in searchArticles"
                        :key="'a-' + item.id"
                        class="home-search-item"
                        @click="goArticle(item)"
                      >
                        <img
                          v-if="item.cover"
                          :src="item.cover"
                          :alt="item.title"
                          class="home-search-thumb"
                        />
                        <div v-else class="home-search-thumb home-search-thumb-ph">文</div>
                        <div class="home-search-meta">
                          <span class="home-search-item-title">{{ item.title }}</span>
                          <span v-if="item.excerpt" class="home-search-desc">{{ item.excerpt }}</span>
                        </div>
                      </li>
                    </ul>
                  </template>
                  <template v-if="showSearchVideos && searchVideos.length">
                    <h3 class="home-search-section-title">视频</h3>
                    <ul class="home-search-ul">
                      <li
                        v-for="item in searchVideos"
                        :key="'v-' + item.id"
                        class="home-search-item"
                        @click="goVideo(item)"
                      >
                        <img
                          v-if="item.cover"
                          :src="item.cover"
                          :alt="item.title"
                          class="home-search-thumb"
                        />
                        <div v-else class="home-search-thumb home-search-thumb-ph">视</div>
                        <div class="home-search-meta">
                          <span class="home-search-item-title">{{ item.title }}</span>
                          <span v-if="item.excerpt" class="home-search-desc">{{ item.excerpt }}</span>
                        </div>
                      </li>
                    </ul>
                  </template>
                  <template v-if="showSearchThemes && searchThemes.length">
                    <h3 class="home-search-section-title">图库</h3>
                    <ul class="home-search-ul">
                      <li
                        v-for="item in searchThemes"
                        :key="'t-' + item.id"
                        class="home-search-item"
                        @click="goTheme(item)"
                      >
                        <img
                          v-if="item.src"
                          :src="item.src"
                          :alt="item.label"
                          class="home-search-thumb"
                        />
                        <div v-else class="home-search-thumb home-search-thumb-ph">图</div>
                        <div class="home-search-meta">
                          <span class="home-search-item-title">{{ item.label || item.id }}</span>
                        </div>
                      </li>
                    </ul>
                  </template>
                </div>
              </template>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  --accent: #0d9488;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
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
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  display: flex;
}

.home-scroll {
  width: 100%;
  padding: 1.5rem 2rem;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.home-search {
  margin-top: 2rem;
}
.home-search-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem;
}
.home-search-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.home-search-input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  outline: none;
}
.home-search-input:focus {
  border-color: var(--accent);
}
.home-search-input::placeholder {
  color: var(--text-muted);
}
.home-search-btn {
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 500;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.home-search-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.home-search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.home-search-results {
  margin-top: 1rem;
}
.home-search-loading,
.home-search-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}
.home-search-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.home-search-tab {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.home-search-tab:hover {
  color: var(--text);
}
.home-search-tab.active {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: rgba(13, 148, 136, 0.3);
}
.home-search-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.home-search-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}
.home-search-ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.home-search-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.home-search-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent);
}
.home-search-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.home-search-thumb-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 1.25rem;
}
.home-search-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.home-search-item-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.home-search-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
