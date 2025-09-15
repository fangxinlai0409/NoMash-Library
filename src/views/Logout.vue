<template>
  <div class="container py-4">
    <h1 class="h4 mb-3">Log out</h1>

    <p class="mb-2">Open DevTools Console to see current user logs.</p>
    <p v-if="userEmail">Current user: <strong>{{ userEmail }}</strong></p>
    <p v-else>Current user: <em>none</em></p>

    <button class="btn btn-outline-danger" @click="logout">Log out</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

const auth = getAuth()
const router = useRouter()
const userEmail = ref('')

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user)
    userEmail.value = user?.email || ''
  })
})

const logout = async () => {
  console.log('Before signOut, currentUser =', auth.currentUser)
  await signOut(auth)
  console.log('After signOut, currentUser =', auth.currentUser) // 应为 null
  router.push('/FireLogin')
}
</script>