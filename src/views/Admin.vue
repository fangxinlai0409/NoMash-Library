<template>
  <div class="container py-4">
    <h1 class="h4">Admin Dashboard</h1>
    <p class="text-muted">Only role = admin can stay on this page.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import db from '@/firebase/init.js'

const router = useRouter()
const auth = getAuth()

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return router.replace('/FireLogin')
  const snap = await getDoc(doc(db, 'users', user.uid))
  const role = snap.exists() ? snap.data().role : ''
  if (role !== 'admin') {
    console.log('Access denied for role:', role)
    alert('Access denied: admin only')
    router.replace('/')
  } else {
    console.log('Access granted to admin.')
  }
})
</script>