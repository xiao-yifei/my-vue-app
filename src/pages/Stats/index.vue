<script setup>
defineOptions({ name: 'Stats' })
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStats } from '@/api'
import { getUserInfo } from '@/utils/auth.js'
import { canManageThemes } from '@/utils/permission.js'

const router = useRouter()
const stats = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    stats.value = await getStats()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载统计数据失败'
    error.value = msg
    ElMessage.error(msg)
    stats.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!canManageThemes(getUserInfo())) {
    router.replace('/home')
    return
  }
  load()
})

function goToTarget(item) {
  const { targetType, targetId } = item
  if (targetType === 'article') router.push(`/article/${targetId}`)
  else if (targetType === 'video') router.push(`/video/${targetId}`)
}
</script>

<template>
  <div class="stats-page">
    <div class="stats-bg"></div>
    <main class="stats-main">
      <div class="stats-container">
        <header class="stats-header">
          <h1 class="stats-title">数据统计</h1>
          <button type="button" class="btn-refresh" @click="load">
            {{ loading ? '加载中…' : '刷新' }}
          </button>
        </header>

        <p v-if="loading" class="stats-loading">加载中…</p>
        <p v-else-if="error" class="stats-error">{{ error }}</p>

        <template v-else-if="stats">
          <section class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.users ?? 0 }}</span>
              <span class="stat-label">用户数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.articles ?? 0 }}</span>
              <span class="stat-label">文章数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.videos ?? 0 }}</span>
              <span class="stat-label">视频数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.themes ?? 0 }}</span>
              <span class="stat-label">图库数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.banners ?? 0 }}</span>
              <span class="stat-label">轮播数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.comments ?? 0 }}</span>
              <span class="stat-label">评论数</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.history ?? 0 }}</span>
              <span class="stat-label">浏览记录</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.total?.notifications ?? 0 }}</span>
              <span class="stat-label">通知数</span>
            </div>
          </section>

          <section class="stats-section">
            <h2 class="section-title">近 7 日活跃</h2>
            <div class="recent-grid">
              <div class="recent-item">
                <span class="recent-value">{{ stats.recent?.comments ?? 0 }}</span>
                <span class="recent-label">新增评论</span>
              </div>
              <div class="recent-item">
                <span class="recent-value">{{ stats.recent?.history ?? 0 }}</span>
                <span class="recent-label">新增浏览</span>
              </div>
            </div>
          </section>

          <section v-if="(stats.topCommented?.length || 0) > 0" class="stats-section">
            <h2 class="section-title">评论最多</h2>
            <ul class="top-list">
              <li
                v-for="(item, i) in stats.topCommented"
                :key="`commented-${i}`"
                class="top-item"
                @click="goToTarget(item)"
              >
                <span class="top-rank">{{ i + 1 }}</span>
                <span class="top-type">{{ item.targetType === 'article' ? '文章' : '视频' }}</span>
                <span class="top-id">{{ item.title || item.targetId }}</span>
                <span class="top-count">{{ item.count }} 条评论</span>
              </li>
            </ul>
          </section>

          <section v-if="(stats.topViewed?.length || 0) > 0" class="stats-section">
            <h2 class="section-title">浏览最多</h2>
            <ul class="top-list">
              <li
                v-for="(item, i) in stats.topViewed"
                :key="`viewed-${i}`"
                class="top-item"
                @click="goToTarget(item)"
              >
                <span class="top-rank">{{ i + 1 }}</span>
                <span class="top-type">{{ item.targetType === 'article' ? '文章' : '视频' }}</span>
                <span class="top-id">{{ item.title || item.targetId }}</span>
                <span class="top-count">{{ item.count }} 次浏览</span>
              </li>
            </ul>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.stats-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.stats-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.stats-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.stats-container {
  max-width: 900px;
  margin: 0 auto;
}
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.stats-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.btn-refresh {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 8px;
  cursor: pointer;
}
.btn-refresh:hover:not(:disabled) {
  background: rgba(13, 148, 136, 0.15);
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.stats-loading,
.stats-error {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}
.stats-error {
  color: #f87171;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
@media (min-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.stat-card {
  background: var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
}
.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.stats-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem;
}
.recent-grid {
  display: flex;
  gap: 1rem;
}
.recent-item {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.recent-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
}
.recent-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.top-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.top-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}
.top-item:hover {
  background: var(--card-bg);
}
.top-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(13, 148, 136, 0.2);
  border-radius: 6px;
  flex-shrink: 0;
}
.top-type {
  font-size: 0.85rem;
  color: var(--text-muted);
  min-width: 40px;
}
.top-id {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.top-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
