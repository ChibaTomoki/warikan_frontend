<script setup lang="ts">
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'
import UnsettledPage from './components/UnsettledPage.vue'
import SettledPage from './components/SettledPage.vue'
import ArchivedPage from './components/ArchivedPage.vue'
import { watch } from 'vue'
import { usePurchasesStore } from './stores/purchases'

type TabName = 'input' | 'unsettled' | 'settled' | 'archived'

const shownTab = ref<TabName>('input')
const { fetchPurchases } = usePurchasesStore()
watch(shownTab, async () => {
  if (shownTab.value === 'input') return
  await fetchPurchases(shownTab.value)
})
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
        <VWindowItem value="unsettled">
          <UnsettledPage />
        </VWindowItem>
        <VWindowItem value="settled">
          <SettledPage />
        </VWindowItem>
        <VWindowItem value="archived">
          <ArchivedPage />
        </VWindowItem>
      </VWindow>
    </VMain>
    <v-bottom-navigation v-model="shownTab">
      <v-btn value="Input">
        <v-icon>mdi-pencil</v-icon>
        入力欄
      </v-btn>
      <v-btn value="unsettled">
        <v-icon>mdi-check-outline</v-icon>
        未精算
      </v-btn>
      <v-btn value="settled">
        <v-icon>mdi-check-bold</v-icon>
        精算済
      </v-btn>
      <v-btn value="archived">
        <v-icon>mdi-delete</v-icon>
        削除済
      </v-btn>
    </v-bottom-navigation>
  </VApp>
</template>
