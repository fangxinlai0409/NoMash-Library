<template>
  <div class="container py-4">
    <h1 class="h4 mb-3">Sign in</h1>

    <div class="mb-3">
      <input class="form-control" type="email" placeholder="Email" v-model="email">
    </div>
    <div class="mb-3">
      <input class="form-control" type="password" placeholder="Password" v-model="password">
    </div>

    <button class="btn btn-primary" @click="signin" :disabled="loading">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Sign in via Firebase
    </button>

    <p class="mt-3" v-if="signedInAs">
      Signed in as: <strong>{{ signedInAs }}</strong><br>
      Role: <span class="badge bg-secondary">{{ signedInRole || 'loading...' }}</span>
    </p>

    <p class="text-danger mt-3" v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import db from '@/firebase/init.js'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const signedInAs = ref('')
const signedInRole = ref('')
const router = useRouter()
const auth = getAuth()

const signin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
    signedInAs.value = cred.user.email


    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) {
      signedInRole.value = snap.data().role
    } else {
      signedInRole.value = '(no role doc)'
    }


    console.log('Firebase Login Successful!')
    console.log('currentUser:', auth.currentUser)
    console.log('role from Firestore:', signedInRole.value)


    if (signedInRole.value === 'admin') router.push('/admin')
    else router.push('/')
  } catch (e) {
    console.log(e.code, e.message)
    errorMsg.value = e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>