<script setup lang="ts">
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'
import UnsettledPage from './components/UnsettledPage.vue'
import SettledPage from './components/SettledPage.vue'
import ArchivedPage from './components/ArchivedPage.vue'

type TabName = 'Input' | 'Unsettled' | 'Settled' | 'Archived'

const shownTab = ref<TabName>('Input')
// TODO: 初めて開くページでfetchPurchasesを行うように修正
// TODO: 完全に削除で確認ダイアログを出す
// TODO: ツールチップでより詳細な情報を表示
</script>

<template>
  <VApp>
    <VMain class="pa-2">
      <VTabs color="green" v-model="shownTab" centered>
        <VTab value="Input"><VIcon>mdi-pencil</VIcon>入力欄</VTab>
        <VTab value="Unsettled"><VIcon>mdi-check-outline</VIcon>未精算</VTab>
        <VTab value="Settled"><VIcon>mdi-check-bold</VIcon>精算済</VTab>
        <VTab value="Archived"><VIcon>mdi-delete</VIcon>削除済</VTab>
      </VTabs>
      <VSheet class="pa-4" elevation="8">
        <VWindow v-model="shownTab" class="pt-8">
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
      </VSheet>
    </VMain>
  </VApp>
</template>
