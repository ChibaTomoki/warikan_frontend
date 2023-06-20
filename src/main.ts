import { createApp } from 'vue'
import './style.css'
import { createPinia, storeToRefs } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Top from './pages/TopPage.vue'
import SignIn from './pages/SignInPage.vue'
import SignUp from './pages/SignUpPage.vue'
import { useAuthStore } from './stores/auth'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const pinia = createPinia()

const routes = [
  {
    component: Top,
    name: 'Top',
    path: '/',
  },
  {
    component: SignIn,
    name: 'SignIn',
    path: '/login',
  },
  {
    component: SignUp,
    name: 'SignUp',
    path: '/register',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(vuetify)
app.use(pinia)
app.use(router)
app.mount('#app')

const { getAuthState } = useAuthStore()
const { isAuthenticated } = storeToRefs(useAuthStore())

router.beforeEach(async (to, from, next) => {
  await getAuthState()
  if (to.name !== 'SignIn' && to.name !== 'SignUp' && !isAuthenticated.value)
    next({ name: 'SignIn' })
  else if (to.name === 'SignIn' && isAuthenticated.value) next({ name: 'Top' })
  else next()
})
