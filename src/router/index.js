import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import { isAuthenticated } from '@/auth'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'

const routes = [
  { path: '/',        name: 'Home',     component: HomeView },
  { path: '/about',   name: 'About',    component: AboutView, meta: { requiresAuth: true } },
  { path: '/login',   name: 'Login',    component: LoginView },
  { path: '/signin',  name: 'FireLogin',    component: FirebaseSigninView },    // or '/firelogin'
  { path: '/register',name: 'FireRegister', component: FirebaseRegisterView },  // or '/fireregister'
  { path: '/:pathMatch(.*)*', redirect: '/' }  
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.meta.requiresAuth) && !isAuthenticated.value) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.name === 'Login' && isAuthenticated.value) {
    return next(to.query.redirect || '/')
  }
  next()
})

export default router