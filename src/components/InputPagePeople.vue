<script setup lang="ts">
import axios, { AxiosResponse } from 'axios'
import { onBeforeMount } from 'vue'

interface Person {
  _id: string
  name: string
  paid: number
  toPay: number
}
interface Props {
  modelValue: Person[]
}
interface Emits {
  (e: 'update:modelValue', modelValue: Person[]): void
}

const emits = defineEmits<Emits>()
defineProps<Props>()

const res: AxiosResponse<{ name: string; _id: string }[]> = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/v1/person`
)

onBeforeMount(() => {
  emits(
    'update:modelValue',
    res.data.map((x) => ({ _id: x._id, name: x.name, paid: 0, toPay: 0 }))
  )
})
</script>

<template>
  <VCard class="my-8" elevation="8">
    <VCardTitle>支払額</VCardTitle>
    <VCardText>
      <template v-for="person in modelValue" :key="person._id">
        <VTextField
          :label="person.name"
          :rules="[
            (v) => !isNaN(Number(v)) || '半角数字のみ入力してください',
            (v) => !/e|\.|-/.test(v) || '半角数字のみ入力してください',
            (v) => v.length < 16 || '15桁以内で入力してください',
          ]"
          clearable
          counter="15"
          placeholder="0"
          suffix="円"
          v-model="person.paid"
        />
      </template>
    </VCardText>
  </VCard>
  <VCard class="my-8" elevation="8">
    <VCardTitle>割り勘金額</VCardTitle>
    <VCardText>
      <template v-for="person in modelValue" :key="person._id">
        <VTextField
          :label="person.name"
          :rules="[
            (v) => !isNaN(Number(v)) || '半角数字のみ入力してください',
            (v) => !/e|\.|-/.test(v) || '半角数字のみ入力してください',
            (v) => v.length < 16 || '15桁以内で入力してください',
          ]"
          clearable
          counter="15"
          placeholder="0"
          suffix="円"
          v-model="person.toPay"
        />
      </template>
    </VCardText>
  </VCard>
</template>
