<script setup>
defineOptions({ name: 'VideoDetail' })
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVideoById, addHistory, addFavorite, removeFavorite, getFavorites } from '@/api'
import { getToken } from '@/utils/auth.js'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()

const video = ref(null)
const loading = ref(true)
const error = ref('')
const favorited = ref(false)
const favoriteId = ref(null)
const favoriteLoading = ref(false)

async function loadVideo() {
  const id = route.params.id
  if (!id) {
    video.value = null
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  video.value = null
  try {
    const data = await getVideoById(id)
    video.value = data
    // 记录浏览历史（仅登录用户）
    if (getToken() && data?.id != null) {
      const targetId = String(data.id)
      addHistory('video', targetId, { title: data.title, cover: data.cover }).catch((err) => {
        console.warn('[history] 记录视频历史失败:', err?.response?.data?.message || err?.message)
      })
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载视频失败'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
  if (getToken() && video.value?.id != null) {
    try {
      const list = await getFavorites()
      const arr = Array.isArray(list) ? list : []
      const item = arr.find(
        (f) => f.targetType === 'video' && String(f.targetId) === String(video.value.id)
      )
      favorited.value = !!item
      favoriteId.value = item ? item.id : null
    } catch {
      favorited.value = false
      favoriteId.value = null
    }
  } else {
    favorited.value = false
    favoriteId.value = null
  }
}

watch(() => route.params.id, loadVideo, { immediate: true })

watch(
  video,
  (v) => {
    document.title = v ? `${v.title} - 视频 - my-vue-app` : '视频 - my-vue-app'
  },
  { immediate: true }
)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function goBack() {
  router.back()
}

async function toggleFavorite() {
  if (!getToken() || !video.value?.id || favoriteLoading.value) return
  favoriteLoading.value = true
  try {
    if (favorited.value) {
      await removeFavorite(favoriteId.value)
      favorited.value = false
      favoriteId.value = null
      ElMessage.success('已取消收藏')
    } else {
      const res = await addFavorite('video', video.value.id, {
        title: video.value.title,
        cover: video.value.cover,
      })
      favorited.value = true
      favoriteId.value = res?.id ?? null
      ElMessage.success('收藏成功')
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '操作失败'
    ElMessage.error(msg)
  } finally {
    favoriteLoading.value = false
  }
}
</script>

<template>
  <div class="detail-page">
    <div class="detail-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="detail-scroll">
      <p v-if="loading" class="detail-loading">加载中…</p>
      <div v-else-if="error" class="detail-error-wrap">
        <p class="detail-error">{{ error }}</p>
        <button type="button" class="btn-back" @click="goBack">返回上一页</button>
      </div>
      <article v-else-if="video" class="detail-container">
        <header class="detail-header">
          <button type="button" class="btn-back" @click="goBack">← 返回上一页</button>
          <h1 class="detail-title">{{ video.title }}</h1>
          <div class="detail-header-meta">
            <time v-if="video.createdAt" class="detail-date">
              {{ formatDate(video.createdAt) }}
            </time>
            <div v-if="video.tags && video.tags.length" class="detail-tags">
              <button
                v-for="tag in video.tags"
                :key="tag"
                type="button"
                class="detail-tag"
                @click="router.push({ path: '/videos', query: { tag } })"
              >
                {{ tag }}
              </button>
            </div>
            <button
              v-if="getToken()"
              type="button"
              class="btn-favorite"
              :class="{ active: favorited }"
              :disabled="favoriteLoading"
              @click="toggleFavorite"
            >
              {{ favorited ? '已收藏' : '收藏' }}
            </button>
          </div>
        </header>

        <div v-if="video.src" class="detail-video-wrap">
          <video
            :src="video.src"
            :poster="video.cover"
            controls
            preload="metadata"
            class="detail-video"
            playsinline
          >
            您的浏览器不支持视频播放。
          </video>
        </div>

        <p v-else class="detail-no-src">暂无视频源</p>

        <div v-if="video.excerpt" class="detail-excerpt">
          {{ video.excerpt }}
        </div>

        <CommentList target-type="video" :target-id="video.id" />
      </article>

      <div v-else class="detail-empty">
        <p>未找到该视频</p>
        <button type="button" class="btn-back" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
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

.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
  -webkit-overflow-scrolling: touch;
}

.detail-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
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

.detail-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 1.5rem;
}

.detail-header-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-favorite {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.btn-favorite:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}
.btn-favorite.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
}
.btn-favorite:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.detail-tag {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.detail-tag:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.btn-back:hover {
  color: var(--text);
  border-color: var(--accent);
}

.detail-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.detail-date {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.detail-video-wrap {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  margin-bottom: 1.5rem;
}

.detail-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.detail-no-src {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  background: var(--card-bg);
  border-radius: 14px;
  margin-bottom: 1.5rem;
}

.detail-excerpt {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
}

.detail-loading,
.detail-error {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.detail-error {
  color: #f87171;
}

.detail-error-wrap {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
}

.detail-error-wrap .btn-back {
  margin-top: 1rem;
}

.detail-empty {
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.detail-empty .btn-back {
  margin-top: 1rem;
}
</style>
