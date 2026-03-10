<script setup>
defineOptions({ name: 'ArticleConfig' })
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from '@/api'
import FileUpload from '@/components/FileUpload.vue'
import { getUserInfo } from '@/utils/auth.js'
import { canManageArticles } from '@/utils/permission.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const list = ref([])
const loading = ref(true)
const error = ref('')
const submitLoading = ref(false)
const formError = ref('')

const isEdit = ref(false)
const form = reactive({
  id: '',
  title: '',
  excerpt: '',
  content: '',
  cover: '',
  tagsStr: '',
})

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await getArticles()
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载文章列表失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!canManageArticles(getUserInfo())) {
    router.replace('/home')
    return
  }
  loadList()
})

function slugify(label) {
  const s = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/^-+|-+$/g, '')
  if (s) return s
  const hash = Math.abs(
    [...label].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
  )
  return 'article-' + hash.toString(36)
}

function generateUniqueId(title, existingIds) {
  const slug = slugify(title) || 'article'
  let id = slug
  let n = 0
  while (existingIds.has(id)) {
    n++
    id = slug + '-' + n
  }
  return id
}

function resetForm() {
  isEdit.value = false
  form.id = ''
  form.title = ''
  form.excerpt = ''
  form.content = ''
  form.cover = ''
  form.tagsStr = ''
  formError.value = ''
}

function setForm(article) {
  isEdit.value = true
  form.id = article.id
  form.title = article.title || ''
  form.excerpt = article.excerpt || ''
  form.content = article.content || ''
  form.cover = article.cover || ''
  form.tagsStr = Array.isArray(article.tags) ? article.tags.join('，') : ''
  formError.value = ''
}

async function submit() {
  formError.value = ''
  const title = form.title.trim()
  if (!title) {
    formError.value = '请填写文章标题'
    return
  }

  const id = isEdit.value
    ? form.id
    : generateUniqueId(title, new Set(list.value.map((a) => a.id)))

  const tagsStr = (form.tagsStr || '').trim()
  const tags = tagsStr ? tagsStr.split(/[，,]\s*/).map((t) => t.trim()).filter(Boolean) : []
  const payload = {
    id,
    title,
    excerpt: form.excerpt.trim() || undefined,
    content: form.content.trim() || '',
    cover: form.cover.trim() || undefined,
    tags: tags.length ? tags : undefined,
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateArticle(id, payload)
      ElMessage.success('修改成功')
      await loadList()
      resetForm()
    } else {
      await createArticle(payload)
      ElMessage.success('创建成功')
      await loadList()
      resetForm()
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '保存失败'
    formError.value = msg
    ElMessage.error(msg)
  } finally {
    submitLoading.value = false
  }
}

async function remove(article) {
  try {
    await ElMessageBox.confirm(
      `确定删除文章「${article.title}」吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  try {
    await deleteArticle(article.id)
    ElMessage.success('已删除')
    await loadList()
    if (form.id === article.id) resetForm()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '删除失败'
    error.value = msg
    ElMessage.error(msg)
  }
}
</script>

<template>
  <div class="config-page">
    <div class="config-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="config-container">
      <header class="config-header">
        <h1 class="config-title">文章配置</h1>
        <p class="config-desc">管理文章列表，可新增、编辑、删除文章</p>
      </header>

      <p v-if="loading" class="config-loading">加载中…</p>
      <p v-else-if="error" class="config-error">{{ error }}</p>

      <div v-else class="config-layout">
        <section class="config-list">
          <div class="list-header">
            <h2>文章列表</h2>
            <button type="button" class="btn-primary" @click="resetForm">+ 新增文章</button>
          </div>
          <ul class="article-list">
            <li
              v-for="a in list"
              :key="a.id"
              class="article-item"
              :class="{ active: form.id === a.id }"
              @click="setForm(a)"
            >
              <img v-if="a.cover" :src="a.cover" :alt="a.title" class="article-thumb" />
              <div v-else class="article-thumb article-thumb-placeholder">无图</div>
              <div class="article-meta">
                <span class="article-label">{{ a.title }}</span>
              </div>
              <div class="article-actions">
                <button type="button" class="btn-sm btn-edit" @click.stop="setForm(a)">编辑</button>
                <button type="button" class="btn-sm btn-danger" @click.stop="remove(a)">删除</button>
              </div>
            </li>
          </ul>
          <p v-if="!list.length" class="list-empty">暂无文章，请点击「新增文章」添加</p>
        </section>

        <section class="config-form-wrap">
          <h2>{{ isEdit ? '编辑文章' : '新增文章' }}</h2>
          <form class="config-form" @submit.prevent="submit">
            <div class="form-row">
              <label>标题 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="文章标题" class="input" />
            </div>
            <div class="form-row">
              <label>摘要</label>
              <input v-model="form.excerpt" type="text" placeholder="简短摘要，用于列表展示" class="input" />
            </div>
            <div class="form-row">
              <label>正文</label>
              <textarea
                v-model="form.content"
                placeholder="支持 HTML 格式"
                class="input input-textarea"
                rows="10"
              ></textarea>
            </div>
            <div class="form-row form-row--with-upload">
              <label>封面图 URL</label>
              <div class="input-upload-row">
                <input v-model="form.cover" type="url" placeholder="https://... 或点击上传" class="input" />
                <FileUpload
                  accept="image/*"
                  @uploaded="form.cover = $event"
                  @error="formError = $event"
                />
              </div>
            </div>
            <div class="form-row">
              <label>标签</label>
              <input
                v-model="form.tagsStr"
                type="text"
                placeholder="多个标签用中文或英文逗号分隔，如：摄影，旅行"
                class="input"
              />
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitLoading"
              >
                {{ submitLoading ? '保存中…' : (isEdit ? '保存修改' : '创建文章') }}
              </button>
              <button v-if="isEdit" type="button" class="btn-secondary" @click="resetForm">
                取消
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-page {
  --accent: #0d9488;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.12);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  overflow-x: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
}

.config-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  overflow: hidden;
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

.config-container {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
}

.config-header {
  margin-bottom: 1.5rem;
}

.config-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.config-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.config-loading,
.config-error {
  position: relative;
  padding: 2rem;
  color: var(--text-muted);
}

.config-error {
  color: #f87171;
}

.config-layout {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .config-layout {
    grid-template-columns: 340px 1fr;
  }
}

.config-list {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 1rem;
  backdrop-filter: blur(20px);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.list-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.btn-primary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  color: white;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.article-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.article-item.active {
  background: rgba(13, 148, 136, 0.2);
  border-color: var(--accent);
}

.article-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.article-thumb-placeholder {
  background: rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.article-meta {
  flex: 1;
  min-width: 0;
}

.article-label {
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.article-actions {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  transition: color 0.2s, border-color 0.2s;
}

.btn-sm:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--accent);
}

.btn-sm.btn-danger {
  border-color: rgba(248, 113, 113, 0.4);
  color: #f87171;
}

.btn-sm.btn-danger:hover:not(:disabled) {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.config-form-wrap {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 1.25rem;
  backdrop-filter: blur(20px);
}

.config-form-wrap h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-row label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.input {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.input-textarea {
  min-height: 120px;
  resize: vertical;
}

.input-upload-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.input-upload-row .input {
  flex: 1;
  min-width: 160px;
}

.required {
  color: #f87171;
}

.form-error {
  font-size: 0.875rem;
  color: #f87171;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.btn-secondary:hover {
  color: var(--text);
  border-color: var(--accent);
}
</style>
