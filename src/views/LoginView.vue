<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/auth'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

const onSubmit = async () => {
  error.value = null
  loading.value = true
  const ok = login(username.value.trim(), password.value)
  loading.value = false
  if (ok) {
    router.push(route.query.redirect || '/about') // 登录后去目标页或 About
  } else {
    error.value = 'Invalid username or password.'
  }
}
</script>

<template>
  <div class="row">
    <div class="col-md-6 col-lg-4 offset-md-3 offset-lg-4">
      <h1 class="h4 text-center mb-4">Member Login</h1>
      <form @submit.prevent="onSubmit" novalidate>
        <div class="mb-3">
          <label class="form-label" for="u">Username</label>
          <input id="u" class="form-control" v-model="username" autocomplete="username" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="p">Password</label>
          <input id="p" type="password" class="form-control" v-model="password" autocomplete="current-password" />
        </div>
        <div v-if="error" class="text-danger mb-3">{{ error }}</div>
        <button class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Login' }}
        </button>
        <p class="text-muted small mt-3">Demo: <code>library</code> / <code>Password123!</code></p>
      </form>
    </div>
  </div>
</template>