<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppShell from '../components/AppShell.vue'
import { ApiError } from '../api/client'
import * as accountApi from '../api/account'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const toast = useToastStore()

const busy = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const emailTouched = ref(false)
let countdownTimer: number | undefined

const form = reactive({
  username: '',
  password: '',
  email: '',
  verifyCode: '',
})

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const emailError = computed(() => {
  const email = form.email.trim()
  if (!emailTouched.value && !email) return ''
  if (!email) return '请输入邮箱'
  if (!isValidEmail(email)) return '邮箱格式不正确'
  return ''
})

function startCountdown() {
  countdown.value = 60
  window.clearInterval(countdownTimer)
  countdownTimer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      window.clearInterval(countdownTimer)
      countdownTimer = undefined
    }
  }, 1000)
}

async function sendCode() {
  if (sendingCode.value || countdown.value > 0) return
  emailTouched.value = true
  if (emailError.value) {
    toast.error(emailError.value)
    return
  }

  sendingCode.value = true
  try {
    await accountApi.sendEmailCode(form.email.trim())
    toast.success('验证码已发送，请查看邮箱')
    startCountdown()
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : String(e)
    toast.error(msg)
  } finally {
    sendingCode.value = false
  }
}

async function submit() {
  if (busy.value) return
  const username = form.username.trim()
  const password = form.password.trim()
  const email = form.email.trim()
  const verifyCode = form.verifyCode.trim()

  emailTouched.value = true
  if (!username || !password || !email || !verifyCode) {
    toast.error('请输入用户名、密码、邮箱和验证码')
    return
  }
  if (emailError.value) {
    toast.error(emailError.value)
    return
  }

  busy.value = true
  try {
    await accountApi.register(username, password, email, verifyCode)
    toast.success('注册成功，请登录')
    await router.push('/account')
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : String(e)
    toast.error(msg)
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  window.clearInterval(countdownTimer)
})
</script>

<template>
  <AppShell>
    <div class="grid two">
      <div class="card">
        <p class="title">注册</p>
        <p class="subtle">创建新账号，邮箱验证码会用于完成注册校验。</p>
        <div class="grid" style="margin-top: 12px">
          <div>
            <label>username</label>
            <input v-model.trim="form.username" autocomplete="username" />
          </div>
          <div>
            <label>password</label>
            <input v-model.trim="form.password" type="password" autocomplete="new-password" />
          </div>
          <div>
            <label>email</label>
            <input
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              :class="{ invalid: !!emailError }"
              @blur="emailTouched = true"
            />
            <p v-if="emailError" class="field-error">{{ emailError }}</p>
          </div>
          <div>
            <label>验证码</label>
            <div class="row code-row">
              <input v-model.trim="form.verifyCode" inputmode="numeric" autocomplete="one-time-code" />
              <button
                class="chip"
                type="button"
                :disabled="sendingCode || countdown > 0"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中' : '发送验证码' }}
              </button>
            </div>
          </div>
          <div class="row" style="justify-content: flex-end">
            <button class="primary" type="button" :disabled="busy" @click="submit">注册</button>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="title">提示</p>
        <p class="muted">先填写邮箱并发送验证码，再提交注册。注册成功后会跳转到账号页登录。</p>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.code-row {
  align-items: stretch;
  gap: 8px;
}

.code-row input {
  flex: 1;
  min-width: 0;
}

.code-row .chip {
  min-width: 108px;
  justify-content: center;
}

.invalid {
  border-color: rgba(255, 92, 92, 0.72);
}

.field-error {
  margin: 6px 0 0;
  color: var(--danger);
  font-size: 12px;
}
</style>
