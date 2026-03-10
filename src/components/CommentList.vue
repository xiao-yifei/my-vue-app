<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getComments, createComment, deleteComment, likeComment } from '@/api'
import { getToken, getUserInfo } from '@/utils/auth.js'

const props = defineProps({
  targetType: { type: String, required: true },
  targetId: { type: [Number, String], required: true },
  sidebar: Boolean,
  collapsible: Boolean,
})

const comments = ref([])
const loading = ref(false)
const expanded = ref(true) // 展开/收起状态，默认展开
const replyTo = ref(null)
const replyContent = ref('')
const submitting = ref(false)
const newContent = ref('')

const isLoggedIn = computed(() => !!getToken())
const userInfo = computed(() => getUserInfo())
const commentCount = computed(() => comments.value.length)

async function loadComments() {
  if (!props.targetId) return
  loading.value = true
  try {
    const data = await getComments(props.targetType, props.targetId)
    comments.value = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
  } catch (err) {
    comments.value = []
    console.warn('[CommentList] 加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.targetType, props.targetId],
  () => loadComments(),
  { immediate: true }
)

async function handleSubmit(parentId = null) {
  const content = (parentId ? replyContent.value : newContent.value)?.trim()
  if (!content) return
  submitting.value = true
  try {
    await createComment(props.targetType, props.targetId, content, parentId)
    newContent.value = ''
    replyContent.value = ''
    replyTo.value = null
    await loadComments()
    ElMessage.success('评论成功')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '评论失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  try {
    await deleteComment(id)
    await loadComments()
    ElMessage.success('已删除')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '删除失败'
    ElMessage.error(msg)
  }
}

async function handleLike(id) {
  if (!isLoggedIn.value) {
    ElMessage.info('请先登录')
    return
  }
  try {
    await likeComment(id)
    await loadComments()
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '操作失败'
    ElMessage.error(msg)
  }
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="comment-list" :class="{ sidebar, collapsible }">
    <div class="comment-header" @click="collapsible ? toggleExpand() : null">
      <h3 class="comment-title">
        评论
        <span v-if="commentCount > 0" class="comment-count">({{ commentCount }})</span>
      </h3>
      <button
        v-if="collapsible"
        type="button"
        class="btn-toggle"
        :aria-expanded="expanded"
        @click.stop="toggleExpand"
      >
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div v-show="!collapsible || expanded" class="comment-body">
      <!-- 发表评论 -->
      <div v-if="isLoggedIn" class="comment-form">
        <textarea
          v-model="newContent"
          placeholder="写下你的评论..."
          rows="2"
          class="comment-input"
          @keydown.ctrl.enter="handleSubmit()"
        />
        <button
          type="button"
          class="btn-submit"
          :disabled="!newContent?.trim() || submitting"
          @click="handleSubmit()"
        >
          发表
        </button>
      </div>
      <p v-else class="comment-login-hint">登录后即可评论</p>

      <!-- 评论列表 -->
      <div v-if="loading" class="comment-loading">加载中…</div>
      <div v-else-if="comments.length === 0" class="comment-empty">暂无评论，快来抢沙发～</div>
      <ul v-else class="comment-ul">
        <li v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-meta">
            <span class="comment-author">{{ c.user?.nickname || c.user?.username || c.userName || '匿名' }}</span>
            <span class="comment-date">{{ formatDate(c.createdAt) }}</span>
          </div>
          <p class="comment-content">{{ c.content }}</p>
          <div class="comment-actions">
            <button type="button" class="btn-action" @click="handleLike(c.id)">
              ♡ {{ c.likes ?? 0 }}
            </button>
            <button
              v-if="isLoggedIn"
              type="button"
              class="btn-action"
              @click="replyTo = replyTo === c.id ? null : c.id"
            >
              回复
            </button>
            <button
              v-if="userInfo?.id === c.user?.id || userInfo?.id === c.userId"
              type="button"
              class="btn-action btn-delete"
              @click="handleDelete(c.id)"
            >
              删除
            </button>
          </div>
          <!-- 回复表单 -->
          <div v-if="replyTo === c.id" class="reply-form">
            <textarea
              v-model="replyContent"
              placeholder="写下回复..."
              rows="2"
              class="comment-input"
              @keydown.ctrl.enter="handleSubmit(c.id)"
            />
            <div class="reply-actions">
              <button type="button" class="btn-cancel" @click="replyTo = null; replyContent = ''">
                取消
              </button>
              <button
                type="button"
                class="btn-submit"
                :disabled="!replyContent?.trim() || submitting"
                @click="handleSubmit(c.id)"
              >
                回复
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.comment-list {
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.06);
  --card-border: rgba(255, 255, 255, 0.1);
}

.comment-list.sidebar {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1rem;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  cursor: default;
}

.comment-list.collapsible .comment-header {
  cursor: pointer;
}

.comment-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.comment-count {
  font-weight: 400;
  color: var(--text-muted);
}

.btn-toggle {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.btn-toggle:hover {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
}

.comment-body {
  transition: opacity 0.2s;
}

.comment-form {
  margin-bottom: 1rem;
}

.comment-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.comment-input::placeholder {
  color: var(--text-muted);
}

.comment-input:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-submit {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-login-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1rem;
}

.comment-loading,
.comment-empty {
  font-size: 0.9rem;
  color: var(--text-muted);
  padding: 1rem 0;
}

.comment-ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.comment-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--card-border);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.comment-author {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.comment-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-content {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.2rem 0;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-action:hover {
  color: var(--accent);
}

.btn-delete:hover {
  color: #f87171;
}

.reply-form {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--card-border);
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-cancel:hover {
  color: var(--text);
}
</style>
