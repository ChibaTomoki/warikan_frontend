<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const { isAuthenticated } = storeToRefs(useAuthStore())
const { signOut } = useAuthStore()
</script>

<template>
  <h1>認証状態確認用ページ</h1>
  <div>認証{{ isAuthenticated ? 'されている' : 'されていない' }}</div>
  <button @click="signOut">ログアウト</button>
</template>
