<script setup>
defineOptions({ name: 'Videos' })
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVideos, getTags, addHistory } from '@/api'
import { getToken } from '@/utils/auth.js'
import { useListScrollRestore } from '@/composables/useListScrollRestore.js'

const route = useRoute()
const router = useRouter()
const noPermissionHint = ref(false)
const list = ref([])
const tagsList = ref([])
const loading = ref(true)
const error = ref('')
const selectedTag = ref('')

const {
  searchQuery,
  scrollContainerRef,
  savedScrollTop,
  onScrollReady,
} = useListScrollRestore('videosState')

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await getVideos()
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载视频列表失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

loadList()

async function loadTags() {
  try {
    const data = await getTags()
    tagsList.value = Array.isArray(data) ? data : []
  } catch {
    tagsList.value = []
  }
}
loadTags()

const filteredList = computed(() => {
  let items = list.value
  const tag = (selectedTag.value || '').trim()
  if (tag) {
    items = items.filter(
      (v) => Array.isArray(v.tags) && v.tags.some((t) => String(t).trim() === tag)
    )
  }
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (v) =>
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.excerpt && v.excerpt.toLowerCase().includes(q))
  )
})

function selectTag(tag) {
  const v = (tag || '').trim()
  selectedTag.value = selectedTag.value === v ? '' : v
  router.replace({
    path: '/videos',
    query: selectedTag.value ? { tag: selectedTag.value } : {},
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return '今天'
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function goToDetail(item) {
  if (getToken() && item?.id != null) {
    addHistory('video', String(item.id), { title: item.title, cover: item.cover }).catch((err) => {
      console.warn('[history] 记录视频历史失败:', err?.response?.data?.message || err?.message)
    })
  }
  router.push(`/video/${item.id}`)
}

watch(loading, (v) => {
  if (!v && savedScrollTop.value > 0) nextTick(onScrollReady)
})

onMounted(() => {
  selectedTag.value = (route.query.tag || '').trim()
  if (route.query.message === 'noPermission') {
    noPermissionHint.value = true
    router.replace({ path: '/videos', query: {} })
    setTimeout(() => { noPermissionHint.value = false }, 4000)
  }
})

watch(
  () => route.query.tag,
  (v) => {
    selectedTag.value = (v || '').trim()
  }
)
</script>

<template>
  <div class="videos-page">
    <div class="videos-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <p v-if="noPermissionHint" class="permission-hint">无权限访问该页面，仅管理员可管理视频配置。</p>
    <main ref="scrollContainerRef" class="videos-main" @scroll="onScrollReady">
      <div class="videos-scroll">
        <p v-if="loading" class="video-loading">加载中…</p>
        <div v-else-if="error" class="video-error-wrap">
          <p class="video-error">{{ error }}</p>
        </div>
        <div v-else class="video-container">
          <header class="video-header">
            <div class="video-header-text">
              <h1 class="video-title">视频</h1>
              <p class="video-desc">发现精彩视频内容</p>
            </div>
            <div class="video-search">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="搜索视频标题或摘要"
                aria-label="搜索视频"
              />
            </div>
          </header>
          <div v-if="tagsList.length" class="video-tags">
            <button
              type="button"
              class="video-tag"
              :class="{ active: !selectedTag }"
              @click="selectTag('')"
            >
              全部
            </button>
            <button
              v-for="tag in tagsList"
              :key="tag"
              type="button"
              class="video-tag"
              :class="{ active: selectedTag === tag }"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <div v-if="filteredList.length" class="video-grid">
            <article
              v-for="item in filteredList"
              :key="item.id"
              class="video-card"
              @click="goToDetail(item)"
            >
              <div class="video-cover-wrap">
                <img
                  v-if="item.cover"
                  :src="item.cover"
                  :alt="item.title"
                  loading="lazy"
                  class="video-cover"
                />
                <div v-else class="video-cover video-cover-placeholder">
                  <span class="video-play-icon">▶</span>
                </div>
                <div class="video-mask">
                  <span class="video-play-btn">▶</span>
                </div>
                <span class="video-date-bar">{{ formatDate(item.createdAt) || '视频' }}</span>
              </div>
              <div class="video-body">
                <h2 class="video-card-title">{{ item.title }}</h2>
                <p class="video-excerpt">{{ item.excerpt || '暂无摘要' }}</p>
              </div>
            </article>
          </div>
          <p v-else class="video-empty">暂无视频，换个关键词试试吧～</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.videos-page {
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

.videos-bg {
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

.videos-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.videos-scroll {
  padding: 1.5rem 2rem;
}

@media (min-width: 768px) {
  .videos-scroll {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

@media (min-width: 1200px) {
  .videos-scroll {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

.video-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.video-header-text {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.video-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.video-search {
  flex-shrink: 0;
  width: 100%;
  max-width: 280px;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent);
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.video-tag {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.video-tag:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.video-tag.active {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: var(--accent);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.video-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.video-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.video-cover-wrap {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
}

.video-play-icon {
  font-size: 2rem;
  color: var(--accent);
  opacity: 0.8;
}

.video-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .video-mask {
  opacity: 1;
}

.video-play-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
  background: var(--accent);
  border-radius: 50%;
  padding-left: 4px;
}

.video-date-bar {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.video-body {
  padding: 1rem;
}

.video-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-excerpt {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-loading {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.video-error-wrap {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
}

.video-error {
  color: #f87171;
  margin: 0;
}

.video-empty {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
