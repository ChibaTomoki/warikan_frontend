import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
  User,
} from 'firebase/auth'
import { auth } from '../firebase'
import { router } from '../main'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed<boolean>(() => currentUser.value !== null)
  const idToken = ref<string | null>(null)

  const getAuthState = async () => {
    new Promise((resolve, reject) => {
      onAuthStateChanged(
        auth,
        (user) => {
          currentUser.value = user
          resolve(user)
        },
        (error) => {
          console.log('error')
          reject(error)
        }
      )
    })
  }
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const idToken = await userCredential.user.getIdToken()
      // await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
      //   idToken,
      // })
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`)
      await signOutFirebase(auth)
      console.log('ログイン完了')
      router.push('/')
    } catch (error) {
      console.log('ログイン失敗')
      console.log(error)
    }
  }
  const signOut = async () => {
    await signOutFirebase(auth)
    await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`)
    router.push({ path: '/login' })
  }
  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const idToken = await userCredential.user.getIdToken()
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
        idToken,
      })
      console.log('登録完了')
      router.push({ path: '/login' })
    } catch (error) {
      console.log('登録失敗')
      console.log(error)
    }
  }

  return {
    accessToken: idToken,
    getAuthState,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
  }
})
