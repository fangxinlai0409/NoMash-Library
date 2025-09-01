import { ref } from 'vue'

export const isAuthenticated = ref(false)

const USER = 'library'
const PASS = 'Password123!'

export function login(u, p) {
  const ok = u === USER && p === PASS
  isAuthenticated.value = ok
  return ok
}
export function logout() {
  isAuthenticated.value = false
}