<script setup lang="ts">
import { ref } from 'vue'
import InputPage from '../components/InputPage.vue'
import UnsettledPage from '../components/UnsettledPage.vue'
import SettledPage from '../components/SettledPage.vue'
import ArchivedPage from '../components/ArchivedPage.vue'
import AuthTestPage from '../components/AuthTestPage.vue'
import axios, { AxiosResponse } from 'axios'

type TabName = 'Input' | 'Unsettled' | 'Settled' | 'Archived'

const shownTab = ref<TabName>('Input')
// TODO: 初めて開くページでfetchPurchasesを行うように修正
// TODO: 完全に削除で確認ダイアログを出す
// TODO: ツールチップでより詳細な情報を表示
const getSample = async () => {
  const res: AxiosResponse = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/sample`
  )
  console.dir(res)
}
</script>

<template>
  <VApp>
    <VBtn @click="getSample">getSample</VBtn>
    <AuthTestPage />
    <VMain class="px-2">
      <VWindow v-model="shownTab" class="pt-8" :touch="false">
        <VWindowItem value="Input">
          <InputPage />
        </VWindowItem>
        <VWindowItem value="Unsettled">
          <UnsettledPage />
        </VWindowItem>
        <VWindowItem value="Settled">
          <SettledPage />
        </VWindowItem>
        <VWindowItem value="Archived">
          <ArchivedPage />
        </VWindowItem>
      </VWindow>
    </VMain>
    <VBottomNavigation v-model="shownTab">
      <VBtn value="Input">
        <VIcon>mdi-pencil</VIcon>
        入力欄
      </VBtn>
      <VBtn value="Unsettled">
        <VIcon>mdi-check-outline</VIcon>
        未精算
      </VBtn>
      <VBtn value="Settled">
        <VIcon>mdi-check-bold</VIcon>
        精算済
      </VBtn>
      <VBtn value="Archived">
        <VIcon>mdi-delete</VIcon>
        削除済
      </VBtn>
    </VBottomNavigation>
  </VApp>
</template>
