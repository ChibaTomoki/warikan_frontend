<script setup lang="ts">
import { ref } from 'vue'
import InputPagePeople from './InputPagePeople.vue'
import axios from 'axios'

interface People {
  _id: string
  name: string
  paid: number
  toPay: number
}

const formRef = ref<{ reset: () => void; validate: () => void }>()
const isValid = ref(null)
const name = ref<string>('購入品ダミー')
const date = ref('2022-11-11')
const note = ref('メモダミー')
const people = ref<People[]>([])
const showsPostedSnackbar = ref(false)

const submit = async () => {
  const form = formRef.value
  if (!form) return

  form.validate()
  if (isValid.value === false) return

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/purchase`,
      {
        date: date.value,
        name: name.value,
        note: note.value,
        people: people.value,
        stage: 'Unsettled',
      }
    )
    console.log(res)
    name.value = ''
    date.value = ''
    note.value = ''
    people.value.map((person) => {
      person.paid = 0
      person.toPay = 0
    })
    form.reset()
    showsPostedSnackbar.value = true
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <VSheet class="pa-8" elevation="8">
    <VForm v-model="isValid" ref="formRef">
      <VTextField
        clearable
        label="購入品"
        required
        :rules="[(v) => !!v || '必須項目です']"
        v-model="name"
      />
      <VTextField
        clearable
        label="購入日"
        required
        :rules="[(v) => !!v || '必須項目です']"
        type="date"
        v-model="date"
      />
      <VTextField label="メモ" v-model="note" />
      <Suspense>
        <template #default>
          <InputPagePeople v-model="people" />
        </template>
        <template #fallback> loading... </template>
      </Suspense>
      <VBtn color="green" :disabled="isValid === false" @click="submit"
        >追加</VBtn
      >
    </VForm>
  </VSheet>
  <VSnackbar timeout="2000" v-model="showsPostedSnackbar"
    >未精算リストに追加しました。</VSnackbar
  >
</template>
