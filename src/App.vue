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
    <v-bottom-navigation v-model="shownTab">
      <v-btn value="Input">
        <v-icon>mdi-pencil</v-icon>
        入力欄
      </v-btn>
      <v-btn value="Unsettled">
        <v-icon>mdi-check-outline</v-icon>
        未精算
      </v-btn>
      <v-btn value="Settled">
        <v-icon>mdi-check-bold</v-icon>
        精算済
      </v-btn>
      <v-btn value="Archived">
        <v-icon>mdi-delete</v-icon>
        削除済
      </v-btn>
    </v-bottom-navigation>
  </VApp>
</template>
