<script setup>
defineOptions({ name: 'Notifications' })
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/api'

const router = useRouter()
const list = ref([])
const unreadCount = ref(0)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getNotifications(false)
    list.value = data?.list ?? []
    unreadCount.value = data?.unreadCount ?? 0
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载通知失败'
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
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

async function markRead(item) {
  if (item.read) return
  try {
    await markNotificationRead(item.id)
    item.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch {
    ElMessage.error('标记失败')
  }
}

async function markAllRead() {
  try {
    await markAllNotificationsRead()
    list.value.forEach((a) => { a.read = true })
    unreadCount.value = 0
    ElMessage.success('已全部标为已读')
  } catch {
    ElMessage.error('操作失败')
  }
}

function goTo(item) {
  markRead(item)
  if (item.link) router.push(item.link)
}

onMounted(load)
</script>

<template>
  <div class="notifications-page">
    <div class="notif-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    <main class="notif-main">
      <div class="notif-container">
        <header class="notif-header">
          <h1 class="notif-title">通知</h1>
          <button
            v-if="unreadCount > 0"
            type="button"
            class="btn-mark-all"
            @click="markAllRead"
          >
            全部标为已读
          </button>
        </header>
        <p v-if="loading" class="notif-loading">加载中…</p>
        <p v-else-if="error" class="notif-error">{{ error }}</p>
        <ul v-else-if="list.length" class="notif-list">
          <li
            v-for="item in list"
            :key="item.id"
            class="notif-item"
            :class="{ unread: !item.read }"
            @click="goTo(item)"
          >
            <div class="notif-dot" v-if="!item.read"></div>
            <div class="notif-body">
              <div class="notif-meta">
                <span class="notif-title-text">{{ item.title }}</span>
                <time class="notif-time">{{ formatDate(item.createdAt) }}</time>
              </div>
              <p v-if="item.content" class="notif-content">{{ item.content }}</p>
            </div>
          </li>
        </ul>
        <p v-else class="notif-empty">暂无通知</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.notifications-page {
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
.notif-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}
.shape-1 {
  width: 300px;
  height: 300px;
  background: var(--accent);
  top: -60px;
  right: -50px;
}
.shape-2 {
  width: 220px;
  height: 220px;
  background: #6366f1;
  bottom: -30px;
  left: -30px;
}
.notif-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.notif-container {
  max-width: 640px;
  margin: 0 auto;
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.notif-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.btn-mark-all {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 8px;
  cursor: pointer;
}
.btn-mark-all:hover {
  background: rgba(13, 148, 136, 0.15);
}
.notif-loading,
.notif-error,
.notif-empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}
.notif-error {
  color: #f87171;
}
.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.notif-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
}
.notif-item:hover {
  background: var(--card-bg);
  border-color: var(--accent);
}
.notif-item.unread {
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.25);
}
.notif-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
}
.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.notif-title-text {
  font-weight: 500;
  color: var(--text);
}
.notif-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.notif-content {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}
</style>
