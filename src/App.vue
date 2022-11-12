<script setup lang="ts">
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'

type TabName = 'Input' | 'Unsettled' | 'Settled' | 'Archived'

const shownTab = ref<TabName>('Input')
</script>

<template>
  <VApp>
    <VMain class="pa-12">
      <VTabs v-model="shownTab" centered>
        <!-- TODO: vuetify3でアイコン追加の方法のリンク(https://next.vuetifyjs.com/ja/features/icon-fonts/)が正しく貼られたらアイコン追加。 -->
        <VTab value="Input">入力欄</VTab>
        <VTab value="Unsettled">未精算リスト</VTab>
        <VTab value="Settled">精算済リスト</VTab>
        <VTab value="Archived">削除済リスト</VTab>
      </VTabs>
      <VWindow v-model="shownTab">
        <VWindowItem value="Input">
          <InputPage />
        </VWindowItem>
      </VWindow>
    </VMain>
  </VApp>
</template>
