<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')

const { signIn } = useAuthStore()
</script>

<template>
  <VContainer>
    <VRow justify="center" class="mt-6">
      <VCol sm="6" md="4" class="v-col-xs-2">
        <h1>Warikan</h1>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="4">
        <VForm class="d-flex flex-column">
          <VTextField v-model="email" label="メールアドレス" type="email" />
          <VTextField v-model="password" label="パスワード" type="password" />
          <VBtn
            @click.prevent="signIn(email, password)"
            color="green"
            class="align-self-end"
            >ログイン</VBtn
          >
          <br />
          <RouterLink to="/register" class="align-self-end"
            >新規登録</RouterLink
          >
        </VForm>
      </VCol>
    </VRow>
  </VContainer>
</template>
