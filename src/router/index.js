import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import { isAuthenticated } from '@/auth'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'
import AddBookView from '@/views/AddBookView.vue'
import BookManager from '@/components/BookManager.vue'
import Logout from '@/views/Logout.vue'
import Admin from '@/views/Admin.vue'
import GetBookCountView from '@/views/GetBookCountView.vue'
import WeatherView from '@/views/WeatherView.vue'
import CountBookAPI from '@/views/CountBookAPI.vue'
import GetAllBookAPI from '@/views/GetAllBookAPI.vue'

const routes = [
  { path: '/',        name: 'Home',     component: HomeView },
  { path: '/about',   name: 'About',    component: AboutView, meta: { requiresAuth: true } },
  { path: '/login',   name: 'Login',    component: LoginView },
  { path: '/signin',  name: 'FireLogin',    component: FirebaseSigninView },    // or '/firelogin'
  { path: '/register',name: 'FireRegister', component: FirebaseRegisterView },  // or '/fireregister'
  { path: '/addbook',  name: 'AddBook', component:AddBookView},
  { path: '/managebooks', name:'ManageBook', component: BookManager},
  { path: '/logout', component: Logout },
  { path: '/admin', component: Admin },
  { path: '/GetBookCount', name:'GetBookCount',component:GetBookCountView},
  { path: '/WeatherCheck', name:'WeatherCheck', component: WeatherView},
  { path: '/CountBookAPI', name:'CountBookAPI', component: CountBookAPI},
  { path: '/GetAllBookAPI', name:'GetAllBookAPI', component: GetAllBookAPI},
  { path: '/:pathMatch(.*)*', redirect: '/' }  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
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