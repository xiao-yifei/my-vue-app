<script setup>
defineOptions({ name: 'Profile' })
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateProfile, changePassword } from '@/api/profile.js'
import { getUserInfo } from '@/utils/auth.js'

const user = ref(null)
const nickname = ref('')
const saving = ref(false)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirm: '' })
const changingPwd = ref(false)

onMounted(() => {
  user.value = getUserInfo()
  nickname.value = user.value?.nickname ?? user.value?.username ?? ''
})

async function saveProfile() {
  const val = (nickname.value || '').trim()
  if (!val) {
    ElMessage.warning('请输入昵称')
    return
  }
  saving.value = true
  try {
    const res = await updateProfile({ nickname: val })
    if (res?.user) {
      const raw = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
      const storage = raw ? (localStorage.getItem('userInfo') ? localStorage : sessionStorage) : localStorage
      storage.setItem('userInfo', JSON.stringify({ ...getUserInfo(), ...res.user }))
    }
    user.value = getUserInfo()
    ElMessage.success('保存成功')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '保存失败'
    ElMessage.error(msg)
  } finally {
    saving.value = false
  }
}

const pwdValid = computed(() => {
  const { oldPassword, newPassword, confirm } = pwdForm.value
  return (
    oldPassword.length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirm
  )
})

async function submitPassword() {
  if (!pwdValid.value) {
    if (pwdForm.value.newPassword !== pwdForm.value.confirm) {
      ElMessage.warning('两次输入的新密码不一致')
    } else {
      ElMessage.warning('密码至少 6 位')
    }
    return
  }
  changingPwd.value = true
  try {
    await changePassword({
      oldPassword: pwdForm.value.oldPassword,
      newPassword: pwdForm.value.newPassword,
    })
    pwdForm.value = { oldPassword: '', newPassword: '', confirm: '' }
    ElMessage.success('密码已修改，请重新登录')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '修改失败'
    ElMessage.error(msg)
  } finally {
    changingPwd.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-bg"></div>
    <main class="profile-main">
      <div class="profile-container">
        <header class="profile-header">
          <h1 class="profile-title">个人设置</h1>
        </header>

        <section class="profile-section">
          <h2 class="section-title">基本信息</h2>
          <div class="profile-card">
            <div class="profile-avatar">
              {{ (user?.nickname || user?.username || '用').charAt(0).toUpperCase() }}
            </div>
            <div class="profile-info">
              <p class="profile-email">{{ user?.email ?? user?.username ?? '—' }}</p>
              <p class="profile-role">用户名：{{ user?.username ?? '—' }}</p>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">昵称</label>
            <input
              v-model="nickname"
              type="text"
              class="form-input"
              placeholder="设置显示昵称"
            />
          </div>
          <button
            type="button"
            class="btn-save"
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </section>

        <section class="profile-section">
          <h2 class="section-title">修改密码</h2>
          <div class="form-row">
            <label class="form-label">当前密码</label>
            <input
              v-model="pwdForm.oldPassword"
              type="password"
              class="form-input"
              placeholder="请输入当前密码"
              autocomplete="current-password"
            />
          </div>
          <div class="form-row">
            <label class="form-label">新密码</label>
            <input
              v-model="pwdForm.newPassword"
              type="password"
              class="form-input"
              placeholder="至少 6 位"
              autocomplete="new-password"
            />
          </div>
          <div class="form-row">
            <label class="form-label">确认新密码</label>
            <input
              v-model="pwdForm.confirm"
              type="password"
              class="form-input"
              placeholder="再次输入新密码"
              autocomplete="new-password"
            />
          </div>
          <button
            type="button"
            class="btn-save"
            :disabled="!pwdValid || changingPwd"
            @click="submitPassword"
          >
            {{ changingPwd ? '提交中…' : '修改密码' }}
          </button>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
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
.profile-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}
.profile-main {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
}
.profile-container {
  max-width: 480px;
  margin: 0 auto;
}
.profile-header {
  margin-bottom: 1.5rem;
}
.profile-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.profile-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: 1rem;
}
.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-info {
  flex: 1;
  min-width: 0;
}
.profile-email,
.profile-role {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  color: var(--text);
}
.profile-role {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.form-row {
  margin-bottom: 0.75rem;
}
.form-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.form-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--accent);
}
.form-input::placeholder {
  color: var(--text-muted);
}
.btn-save {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 500;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.profile-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 2rem 0 0;
}
</style>
