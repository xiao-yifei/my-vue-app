<script setup>
defineOptions({ name: 'MyComments' })
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyComments, deleteComment } from '@/api'

const router = useRouter()
const list = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getMyComments(50)
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '加载失败'
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
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goToTarget(item) {
  if (item.targetType === 'article') router.push(`/article/${item.targetId}`)
  else if (item.targetType === 'video') router.push(`/video/${item.targetId}`)
}

function typeLabel(type) {
  return type === 'article' ? '文章' : type === 'video' ? '视频' : '—'
}

async function removeItem(item, e) {
  e.stopPropagation()
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteComment(item.id)
    list.value = list.value.filter((x) => x.id !== item.id)
    ElMessage.success('已删除')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '删除失败'
    ElMessage.error(msg)
  }
}

onMounted(load)
</script>

<template>
  <div class="my-comments-page">
    <div class="my-comments-bg"></div>
    <main class="my-comments-main">
      <div class="my-comments-container">
        <header class="my-comments-header">
          <h1 class="my-comments-title">我的评论</h1>
        </header>
        <p v-if="loading" class="my-comments-loading">加载中…</p>
        <p v-else-if="error" class="my-comments-error">{{ error }}</p>
        <div v-else-if="list.length === 0" class="my-comments-empty">
          <p>暂无评论，在文章或视频详情页可发表评论</p>
        </div>
        <ul v-else class="my-comments-list">
          <li
            v-for="item in list"
            :key="item.id"
            class="my-comments-item"
            @click="goToTarget(item)"
          >
            <div class="my-comments-meta">
              <span class="my-comments-type">{{ typeLabel(item.targetType) }}</span>
              <span class="my-comments-target">{{ item.targetTitle || item.targetId || '未知' }}</span>
              <time class="my-comments-time">{{ formatDate(item.createdAt) }}</time>
            </div>
            <p class="my-comments-content">{{ item.content }}</p>
            <button
              type="button"
              class="btn-remove"
              title="删除"
              @click="removeItem(item, $event)"
            >
              删除
            </button>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.my-comments-page {
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
  font-family: 'Outfit', system-ui, sans-serif;
}
.my-comments-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.my-comments-main {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.my-comments-container {
  max-width: 720px;
  margin: 0 auto;
}
.my-comments-header {
  margin-bottom: 1.5rem;
}
.my-comments-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.my-comments-loading,
.my-comments-error,
.my-comments-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.my-comments-error {
  color: #f87171;
}
.my-comments-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.my-comments-item {
  position: relative;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.my-comments-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent);
}
.my-comments-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.my-comments-type {
  font-size: 0.75rem;
  color: var(--accent);
}
.my-comments-target {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.my-comments-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.my-comments-content {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.btn-remove {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.btn-remove:hover {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.5);
}
</style>
