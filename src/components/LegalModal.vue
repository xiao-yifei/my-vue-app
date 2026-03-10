<script setup>
import { ElDialog } from 'element-plus'

defineProps({
  modelValue: { type: Boolean, default: false },
  type: { type: String, validator: (v) => ['terms', 'privacy'].includes(v), required: true },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="type === 'terms' ? '用户协议' : '隐私政策'"
    width="90%"
    max-width="560px"
    class="legal-modal"
    modal-class="legal-modal-overlay"
    append-to-body
    :close-on-click-modal="true"
    destroy-on-close
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="legal-content">
      <p class="legal-updated">最后更新：2025年3月</p>

      <template v-if="type === 'terms'">
        <section class="legal-section">
          <h3 class="legal-title">一、协议的接受与修改</h3>
          <p>欢迎使用本应用。当您注册、登录或使用本应用服务时，即表示您已阅读、理解并同意受本用户协议的约束。我们有权根据需要修改本协议条款，修改后的协议将在应用内公布。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">二、账号注册与安全</h3>
          <p>您需提供真实、准确、完整的注册信息，并妥善保管账号与密码。您应对账号下的所有行为负责。如发现账号被盗用或存在安全风险，请及时通知我们并修改密码。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">三、用户行为规范</h3>
          <p>在使用本应用时，您同意不得发布违法违规、侵权、虚假、骚扰、侮辱或歧视性内容；不得利用本应用从事欺诈、传播病毒或其他危害网络安全的行为；不得未经授权访问、篡改或破坏系统或他人数据。违反上述规定的，我们有权限制或终止您的账号及服务。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">四、知识产权与免责</h3>
          <p>本应用内的文字、图片、软件等知识产权均归我们或相关权利人所有。本应用按「现状」提供，我们不对服务的持续性、稳定性、准确性作任何保证。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">五、其他</h3>
          <p>本协议的解释与适用以中华人民共和国法律为准。如对本协议有任何疑问，请通过应用内「关于」页面与我们取得联系。</p>
        </section>
      </template>

      <template v-else>
        <section class="legal-section">
          <h3 class="legal-title">一、信息收集</h3>
          <p>我们收集的信息包括：您注册时提供的用户名、邮箱；您使用服务时产生的浏览历史、收藏、评论等行为数据；以及设备信息、IP 地址等用于安全与运营所必要的信息。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">二、信息使用</h3>
          <p>我们使用收集的信息用于向您提供、维护和改进服务；识别您的身份并保障账号安全；向您发送与服务相关的通知；统计与分析以优化产品体验；遵守法律法规。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">三、信息存储与保护</h3>
          <p>您的信息存储于具备安全措施的服务环境中。敏感信息（如密码）均经加密存储，我们无法直接查看您的密码明文。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">四、信息共享与 Cookie</h3>
          <p>我们不会向第三方出售您的个人数据。我们使用 Cookie 和本地存储来保存登录状态、主题偏好等信息。</p>
        </section>
        <section class="legal-section">
          <h3 class="legal-title">五、您的权利</h3>
          <p>您有权查询、更正或删除您的个人信息。您可以在应用内通过「个人设置」管理部分信息，或通过联系我们提出相关请求。</p>
        </section>
      </template>
    </div>
    <template #footer>
      <button type="button" class="legal-btn" @click="close">关闭</button>
    </template>
  </ElDialog>
</template>

<style scoped>
.legal-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
.legal-updated {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
  margin: 0 0 1rem;
}
.legal-section {
  margin-bottom: 1rem;
}
.legal-section:last-child {
  margin-bottom: 0;
}
.legal-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--el-color-primary);
  margin: 0 0 0.4rem;
}
.legal-content p {
  margin: 0;
  color: var(--el-text-color-regular);
}
.legal-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: #fff;
  background: var(--el-color-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.legal-btn:hover {
  background: var(--el-color-primary-dark-2);
}

:deep(.el-dialog__body) {
  padding-top: 0.5rem;
  overflow: hidden;
  max-height: none;
}
:deep(.el-dialog__header) {
  padding-bottom: 0.5rem;
}
</style>
