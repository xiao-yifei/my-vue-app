<script setup>
defineOptions({ name: 'VideoConfig' })
import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '@/api'
import FileUpload from '@/components/FileUpload.vue'
import { getUserInfo } from '@/utils/auth.js'
import { canManageVideos } from '@/utils/permission.js'
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
  cover: '',
  src: '',
  tagsStr: '',
})

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

onMounted(() => {
  if (!canManageVideos(getUserInfo())) {
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
  return 'video-' + hash.toString(36)
}

function generateUniqueId(title, existingIds) {
  const slug = slugify(title) || 'video'
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
  form.cover = ''
  form.src = ''
  form.tagsStr = ''
  formError.value = ''
}

function setForm(video) {
  isEdit.value = true
  form.id = video.id
  form.title = video.title || ''
  form.excerpt = video.excerpt || ''
  form.cover = video.cover || ''
  form.src = video.src || ''
  form.tagsStr = Array.isArray(video.tags) ? video.tags.join('，') : ''
  formError.value = ''
}

async function submit() {
  formError.value = ''
  const title = form.title.trim()
  if (!title) {
    formError.value = '请填写视频标题'
    return
  }
  if (!form.src.trim()) {
    formError.value = '请填写视频地址'
    return
  }

  const id = isEdit.value
    ? form.id
    : generateUniqueId(title, new Set(list.value.map((v) => v.id)))

  const tagsStr = (form.tagsStr || '').trim()
  const tags = tagsStr ? tagsStr.split(/[，,]\s*/).map((t) => t.trim()).filter(Boolean) : []
  const payload = {
    title,
    excerpt: form.excerpt.trim() || undefined,
    cover: form.cover.trim() || undefined,
    src: form.src.trim(),
    tags: tags.length ? tags : undefined,
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateVideo(id, payload)
      ElMessage.success('修改成功')
      await loadList()
      resetForm()
    } else {
      await createVideo({ id, ...payload })
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

async function remove(video) {
  try {
    await ElMessageBox.confirm(
      `确定删除视频「${video.title}」吗？此操作不可恢复。`,
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
    await deleteVideo(video.id)
    ElMessage.success('已删除')
    await loadList()
    if (form.id === video.id) resetForm()
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
        <h1 class="config-title">视频配置</h1>
        <p class="config-desc">管理视频列表，可新增、编辑、删除视频</p>
      </header>

      <p v-if="loading" class="config-loading">加载中…</p>
      <p v-else-if="error" class="config-error">{{ error }}</p>

      <div v-else class="config-layout">
        <section class="config-list">
          <div class="list-header">
            <h2>视频列表</h2>
            <button type="button" class="btn-primary" @click="resetForm">+ 新增视频</button>
          </div>
          <ul class="video-list">
            <li
              v-for="v in list"
              :key="v.id"
              class="video-item"
              :class="{ active: form.id === v.id }"
              @click="setForm(v)"
            >
              <div v-if="v.cover" class="video-thumb-wrap">
                <img :src="v.cover" :alt="v.title" class="video-thumb" />
                <span class="video-thumb-icon">▶</span>
              </div>
              <div v-else class="video-thumb video-thumb-placeholder">无封面</div>
              <div class="video-meta">
                <span class="video-label">{{ v.title }}</span>
              </div>
              <div class="video-actions">
                <button type="button" class="btn-sm btn-edit" @click.stop="setForm(v)">编辑</button>
                <button type="button" class="btn-sm btn-danger" @click.stop="remove(v)">删除</button>
              </div>
            </li>
          </ul>
          <p v-if="!list.length" class="list-empty">暂无视频，请点击「新增视频」添加</p>
        </section>

        <section class="config-form-wrap">
          <h2>{{ isEdit ? '编辑视频' : '新增视频' }}</h2>
          <form class="config-form" @submit.prevent="submit">
            <div class="form-row">
              <label>标题 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="视频标题" class="input" />
            </div>
            <div class="form-row">
              <label>简介</label>
              <input v-model="form.excerpt" type="text" placeholder="简短简介，用于列表展示" class="input" />
            </div>
            <div class="form-row">
              <label>视频地址 <span class="required">*</span></label>
              <input v-model="form.src" type="url" placeholder="https://... 视频直链" class="input" />
            </div>
            <div class="form-row">
              <label>标签</label>
              <input
                v-model="form.tagsStr"
                type="text"
                placeholder="多个标签用中文或英文逗号分隔"
                class="input"
              />
            </div>
            <div class="form-row form-row--with-upload">
              <label>封面图 URL</label>
              <div class="input-upload-row">
                <input v-model="form.cover" type="url" placeholder="https://... 或点击上传" class="input" />
                <FileUpload
                  accept="image/*"
                  @uploaded="form.cover = $event"
                  @error="(msg) => { formError = msg }"
                />
              </div>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitLoading"
              >
                {{ submitLoading ? '保存中…' : (isEdit ? '保存修改' : '创建视频') }}
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

.video-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.video-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.video-item.active {
  background: rgba(13, 148, 136, 0.2);
  border-color: var(--accent);
}

.video-thumb-wrap {
  position: relative;
  width: 80px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-thumb-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  background: rgba(0, 0, 0, 0.4);
}

.video-thumb-placeholder {
  width: 80px;
  height: 45px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  font-size: 0.75rem;
}

.video-meta {
  flex: 1;
  min-width: 0;
}

.video-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.2s;
}

.btn-edit {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: rgba(13, 148, 136, 0.3);
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-danger {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
}

.btn-danger:hover {
  opacity: 0.9;
}

.list-empty {
  padding: 2rem 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.config-form-wrap {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
}

.config-form-wrap h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1.25rem;
}

.config-form .form-row {
  margin-bottom: 1rem;
}

.config-form label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.required {
  color: #f87171;
}

.input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  border-color: var(--accent);
}

.input::placeholder {
  color: var(--text-muted);
}

.form-row--with-upload .input-upload-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.form-row--with-upload .input {
  flex: 1;
}

.form-error {
  color: #f87171;
  font-size: 0.9rem;
  margin: -0.5rem 0 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  color: var(--text);
  border-color: var(--accent);
}
</style>
