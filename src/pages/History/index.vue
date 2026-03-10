<script setup>
defineOptions({ name: 'History' })
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHistory, removeHistory, clearHistory } from '@/api'

const router = useRouter()
const list = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getHistory(50)
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载历史失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function goTo(item) {
  const { targetType, targetId } = item
  if (targetType === 'article') router.push(`/article/${targetId}`)
  else if (targetType === 'video') router.push(`/video/${targetId}`)
}

async function removeItem(item, e) {
  e.stopPropagation()
  try {
    await removeHistory(item.id)
    list.value = list.value.filter((x) => x.id !== item.id)
    ElMessage.success('已删除')
  } catch {
    ElMessage.error('删除失败')
  }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm('确定清空全部浏览历史吗？', '确认', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await clearHistory()
    list.value = []
    ElMessage.success('已清空')
  } catch {
    ElMessage.error('清空失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="history-page">
    <div class="history-bg"></div>
    <main class="history-main">
      <div class="history-container">
        <header class="history-header">
          <h1 class="history-title">浏览历史</h1>
          <button
            v-if="list.length"
            type="button"
            class="btn-clear"
            @click="clearAll"
          >
            清空全部
          </button>
        </header>
        <p v-if="loading" class="history-loading">加载中…</p>
        <p v-else-if="error" class="history-error">{{ error }}</p>
        <ul v-else-if="list.length" class="history-list">
          <li
            v-for="item in list"
            :key="item.id"
            class="history-item"
            @click="goTo(item)"
          >
            <div class="history-thumb">
              <img
                v-if="item.target?.cover"
                :src="item.target.cover"
                :alt="item.target.title"
                class="history-img"
              />
              <div v-else class="history-img history-placeholder">
                {{ item.targetType === 'article' ? '文' : '视' }}
              </div>
            </div>
            <div class="history-meta">
              <span class="history-label">{{ item.target?.title || '未知' }}</span>
              <time class="history-time">{{ formatDate(item.viewedAt) }}</time>
            </div>
            <button
              type="button"
              class="btn-remove"
              aria-label="删除"
              @click="removeItem(item, $event)"
            >
              ×
            </button>
          </li>
        </ul>
        <p v-else class="history-empty">暂无浏览历史</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.history-page {
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
.history-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.history-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.history-container {
  max-width: 720px;
  margin: 0 auto;
}
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.history-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.btn-clear {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: #f87171;
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: 8px;
  cursor: pointer;
}
.btn-clear:hover {
  background: rgba(248, 113, 113, 0.1);
}
.history-loading,
.history-error,
.history-empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}
.history-error {
  color: #f87171;
}
.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}
.history-item:hover {
  background: var(--card-bg);
}
.history-thumb {
  width: 100px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}
.history-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.history-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-muted);
}
.history-meta {
  flex: 1;
  min-width: 0;
}
.history-label {
  display: block;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.btn-remove {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 1.2rem;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-remove:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}
</style>
