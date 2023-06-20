<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')

const { signUp } = useAuthStore()
</script>

<template>
  <VContainer>
    <VRow justify="center" class="mt-6">
      <VCol sm="6" md="4" class="v-col-xs-2">
        <h1>新規登録</h1>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="4">
        <VForm class="d-flex flex-column">
          <VTextField v-model="email" label="メールアドレス" type="email" />
          <VTextField v-model="password" label="パスワード" type="password" />
          <VBtn
            @click.prevent="signUp(email, password)"
            color="green"
            class="align-self-end"
            >登録</VBtn
          >
          <br />
          <RouterLink to="/login" class="align-self-end"
            >ログインページ</RouterLink
          >
        </VForm>
      </VCol>
    </VRow>
  </VContainer>
</template>
