<script setup lang="ts">
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'
import UnsettledPage from './components/UnsettledPage.vue'

type TabName = 'Input' | 'Unsettled' | 'Settled' | 'Archived'
type Stage = 'Unsettled' | 'Settled' | 'Archived'
interface Person {
  _id: string
  name: string
  paid: number
  toPay: number
}
interface Purchase {
  _id: string
  name: string
  date: string
  note: string
  people: Person[]
  stage: Stage
}

const shownTab = ref<TabName>('Unsettled')
</script>

<template>
  <VApp>
    <VMain class="pa-12">
      <VTabs color="green" v-model="shownTab" centered>
        <VTab value="Input"><VIcon>mdi-pencil</VIcon>入力欄</VTab>
        <VTab value="Unsettled"
          ><VIcon>mdi-check-outline</VIcon>未精算リスト</VTab
        >
        <VTab value="Settled"><VIcon>mdi-check-bold</VIcon>精算済リスト</VTab>
        <VTab value="Archived"><VIcon>mdi-delete</VIcon>削除済リスト</VTab>
      </VTabs>
      <VSheet class="pa-8" elevation="8">
        <VWindow v-model="shownTab" class="pt-8">
          <VWindowItem value="Input">
            <InputPage />
          </VWindowItem>
          <VWindowItem value="Unsettled">
            <UnsettledPage />
          </VWindowItem>
        </VWindow>
      </VSheet>
    </VMain>
  </VApp>
</template>
