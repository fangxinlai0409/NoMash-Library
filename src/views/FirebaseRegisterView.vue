<template>
  <div class="container py-4">
    <h1 class="h4 mb-3">Create an account (with role)</h1>

    <div class="mb-3">
      <input class="form-control" type="email" placeholder="Email" v-model="email">
    </div>
    <div class="mb-3">
      <input class="form-control" type="password" placeholder="Password" v-model="password">
    </div>
    <div class="mb-3">
      <label class="form-label">Role</label>
      <select class="form-select" v-model="role">
        <option value="admin">admin</option>
        <option value="editor">editor</option>
        <option value="member">member</option>
      </select>
    </div>

    <button class="btn btn-primary" @click="register" :disabled="loading">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Save to Firebase
    </button>

    <p class="text-danger mt-3" v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import db from '@/firebase/init.js'

const email = ref('')
const password = ref('')
const role = ref('member') // 默认角色
const loading = ref(false)
const errorMsg = ref('')
const router = useRouter()
const auth = getAuth()

const register = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      role: role.value,
      createdAt: serverTimestamp(),
    })
    console.log('Firebase Register Successful!', cred.user.uid, 'role =', role.value)
    router.push('/FireLogin')
  } catch (e) {
    console.log(e.code, e.message)
    errorMsg.value = e.message || 'Register failed'
  } finally {
    loading.value = false
  }
}
</script>