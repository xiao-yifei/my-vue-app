<script setup>
defineOptions({ name: 'BannerConfig' })
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from '@/api'
import FileUpload from '@/components/FileUpload.vue'
import { getUserInfo } from '@/utils/auth.js'
import { canManageThemes } from '@/utils/permission.js'
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
  image: '',
  link: '',
  sortOrder: 0,
  enabled: true,
})

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await getBanners(false) // 获取全部，含未启用
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '加载轮播列表失败'
    error.value = msg
    ElMessage.error(msg)
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!canManageThemes(getUserInfo())) {
    router.replace('/home')
    return
  }
  loadList()
})

function slugify(s) {
  const t = String(s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
  return t || 'banner-' + Date.now().toString(36)
}

function resetForm() {
  isEdit.value = false
  form.id = ''
  form.title = ''
  form.image = ''
  form.link = ''
  form.sortOrder = list.value.length
  form.enabled = true
  formError.value = ''
}

function setForm(banner) {
  isEdit.value = true
  form.id = banner.id
  form.title = banner.title || ''
  form.image = banner.image || ''
  form.link = banner.link || ''
  form.sortOrder = banner.sortOrder ?? 0
  form.enabled = banner.enabled !== false
  formError.value = ''
}

async function submit() {
  formError.value = ''
  if (!form.image.trim()) {
    formError.value = '请填写图片地址'
    return
  }
  const id = isEdit.value ? form.id : (form.id || slugify(form.title))
  const payload = {
    title: form.title.trim(),
    image: form.image.trim(),
    link: form.link.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    enabled: form.enabled,
  }
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateBanner(id, payload)
      ElMessage.success('修改成功')
      await loadList()
      resetForm()
    } else {
      await createBanner({ id, ...payload })
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

async function remove(banner) {
  try {
    await ElMessageBox.confirm(`确定删除轮播「${banner.title || banner.id}」吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteBanner(banner.id)
    ElMessage.success('已删除')
    await loadList()
    if (form.id === banner.id) resetForm()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '删除失败'
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
        <h1 class="config-title">轮播图配置</h1>
        <p class="config-desc">管理首页轮播图，可新增、编辑、删除</p>
      </header>
      <p v-if="loading" class="config-loading">加载中…</p>
      <p v-else-if="error" class="config-error">{{ error }}</p>
      <div v-else class="config-layout">
        <section class="config-list">
          <div class="list-header">
            <h2>轮播列表</h2>
            <button type="button" class="btn-primary" @click="resetForm">+ 新增</button>
          </div>
          <ul class="banner-list">
            <li
              v-for="b in list"
              :key="b.id"
              class="banner-item"
              :class="{ active: form.id === b.id }"
              @click="setForm(b)"
            >
              <img v-if="b.image" :src="b.image" :alt="b.title" class="banner-thumb" />
              <div v-else class="banner-thumb banner-thumb-placeholder">无图</div>
              <div class="banner-meta">
                <span class="banner-label">{{ b.title || b.id }}</span>
              </div>
              <div class="banner-actions">
                <button type="button" class="btn-sm btn-edit" @click.stop="setForm(b)">编辑</button>
                <button type="button" class="btn-sm btn-danger" @click.stop="remove(b)">删除</button>
              </div>
            </li>
          </ul>
          <p v-if="!list.length" class="list-empty">暂无轮播，请点击「新增」添加</p>
        </section>
        <section class="config-form-wrap">
          <h2>{{ isEdit ? '编辑轮播' : '新增轮播' }}</h2>
          <form class="config-form" @submit.prevent="submit">
            <div class="form-row">
              <label>标题</label>
              <input v-model="form.title" type="text" placeholder="轮播标题" class="input" />
            </div>
            <div class="form-row form-row--with-upload">
              <label>图片 URL <span class="required">*</span></label>
              <div class="input-upload-row">
                <input v-model="form.image" type="url" placeholder="https://... 或上传" class="input" />
                <FileUpload accept="image/*" @uploaded="form.image = $event" @error="(m) => (formError = m)" />
              </div>
            </div>
            <div class="form-row">
              <label>链接</label>
              <input v-model="form.link" type="text" placeholder="/home 或 https://..." class="input" />
            </div>
            <div class="form-row row-inline">
              <label class="checkbox-wrap">
                <input v-model="form.enabled" type="checkbox" />
                <span>启用</span>
              </label>
            </div>
            <p v-if="formError" class="form-error">{{ formError }}</p>
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="submitLoading">
                {{ submitLoading ? '保存中…' : (isEdit ? '保存' : '创建') }}
              </button>
              <button v-if="isEdit" type="button" class="btn-secondary" @click="resetForm">取消</button>
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
}
.config-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}
.config-loading,
.config-error {
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
    grid-template-columns: 300px 1fr;
  }
}
.config-list {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 1rem;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-weight: 500;
  color: white;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.banner-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 50vh;
  overflow-y: auto;
}
.banner-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.banner-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.banner-item.active {
  background: rgba(13, 148, 136, 0.2);
  border: 1px solid var(--accent);
}
.banner-thumb {
  width: 80px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 8px;
  object-fit: cover;
}
.banner-thumb-placeholder {
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.banner-meta {
  flex: 1;
  min-width: 0;
}
.banner-label {
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.banner-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn-edit {
  color: var(--accent);
  background: rgba(13, 148, 136, 0.15);
  border-color: rgba(13, 148, 136, 0.3);
}
.btn-danger {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
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
}
.config-form-wrap h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1.25rem;
}
.form-row {
  margin-bottom: 1rem;
}
.form-row label {
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
  box-sizing: border-box;
}
.input:focus {
  border-color: var(--accent);
}
.form-row--with-upload .input-upload-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.form-row--with-upload .input {
  flex: 1;
}
.row-inline .checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  cursor: pointer;
}
.btn-secondary:hover {
  color: var(--text);
  border-color: var(--accent);
}
</style>
