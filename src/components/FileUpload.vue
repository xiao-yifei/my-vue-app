<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile } from '@/api'

const props = defineProps({
  accept: { type: String, default: 'image/*' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['uploaded', 'error'])

const inputRef = ref(null)
const loading = ref(false)

function chooseFile() {
  if (props.disabled || loading.value) return
  inputRef.value?.click()
}

async function onInput(e) {
  const file = e.target?.files?.[0]
  if (!file) return
  loading.value = true
  emit('error', '')
  try {
    const res = await uploadFile(file)
    if (res?.url) {
      ElMessage.success('上传成功')
      emit('uploaded', res.url)
    } else {
      const msg = '未返回图片地址'
      emit('error', msg)
      ElMessage.error(msg)
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '上传失败'
    emit('error', msg)
    ElMessage.error(msg)
  } finally {
    loading.value = false
    e.target.value = ''
  }
}
</script>

<template>
  <span class="file-upload">
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="file-input"
      @input="onInput"
    />
    <button
      type="button"
      class="upload-btn"
      :disabled="disabled || loading"
      @click="chooseFile"
    >
      {{ loading ? '上传中…' : '上传' }}
    </button>
  </span>
</template>

<style scoped>
.file-upload {
  display: inline-flex;
  align-items: center;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--accent, #0d9488);
  background: rgba(13, 148, 136, 0.12);
  border: 1px solid rgba(13, 148, 136, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: rgba(13, 148, 136, 0.2);
  border-color: var(--accent, #0d9488);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
