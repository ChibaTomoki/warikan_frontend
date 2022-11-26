<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeopleStore } from '../stores/people'
import { usePurchasesStore } from '../stores/purchases'
import { useLoadingStore } from '../stores/loading'

interface Person {
  _id: string | null
  name: string
}
interface PurchasePersonForInput extends Person {
  _id: string
  paid: string | null
  toPay: string | null
}

const { deletePerson, fetchPeople, postPerson } = usePeopleStore()
const { getPeople } = storeToRefs(usePeopleStore())
const { postPurchase } = usePurchasesStore()
const { getPurchasePeople } = storeToRefs(usePurchasesStore())
const { getIsLoading } = storeToRefs(useLoadingStore())
const formRef = ref<{
  validate: () => Promise<void>
  reset: () => Promise<void>
}>()
const isValid = ref(null)
const name = ref<string | null>(null)
const today = new Date()
const date = ref<string | null>(
  `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${(
    '0' + today.getDate()
  ).slice(-2)}`
)
const note = ref<string | null>(null)
const purchasePeople = ref<PurchasePersonForInput[]>([])
const showsPostedSnackbar = ref(false)
const showsAddPersonDialog = ref(false)
const personToAdd = ref<Person>({ _id: null, name: '' })

watchEffect(() => {
  purchasePeople.value = getPeople.value.map((person) => ({
    _id: person._id,
    name: person.name,
    paid: '',
    toPay: '',
  }))
})

watch(showsAddPersonDialog, () => {
  if (showsAddPersonDialog.value) personToAdd.value = { _id: null, name: '' }
})

const submit = async () => {
  const form = formRef.value
  if (!form) return

  await form.validate()
  if (isValid.value === false) return
  try {
    if (!name.value) throw '購入品が不正です'
    if (!date.value) throw '日付が不正です'
    await postPurchase(
      name.value,
      date.value,
      note.value ?? '',
      purchasePeople.value.map((person) => ({
        ...person,
        paid: person.paid ? Number(person.paid) : 0,
        toPay: person.toPay ? Number(person.toPay) : 0,
      }))
    )
    showsPostedSnackbar.value = true
    await form.reset()
  } catch (error) {
    console.log(error)
  }
}
const addPerson = () => {
  const target = getPurchasePeople.value.find(
    (person) => person.name === personToAdd.value.name
  )
  if (target) postPerson(target.name, target._id)
  else postPerson(personToAdd.value.name)
  showsAddPersonDialog.value = false
}
const addPersonByEnter = (e: Event) => {
  if (!(e instanceof KeyboardEvent)) return
  if (e.key === 'Enter') addPerson()
}

fetchPeople()
</script>

<template>
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
    <VTextField clearable label="メモ" v-model="note" />
    <VDialog v-model="showsAddPersonDialog">
      <VCard>
        <VCardTitle>割り勘対象者を追加</VCardTitle>
        <VCardText>
          <VCombobox
            v-model="personToAdd.name"
            :items="
              getPurchasePeople
                .filter(
                  (person) =>
                    !getPeople
                      .map((person) => person.name)
                      .includes(person.name)
                )
                .map((person) => person.name)
            "
            label="追加する人の名前"
            @keydown="addPersonByEnter"
          />
        </VCardText>
        <VCardActions><VBtn @click="addPerson">追加</VBtn></VCardActions>
      </VCard>
    </VDialog>
    <div v-if="getIsLoading" class="d-flex justify-center mt-16">
      <VProgressCircular indeterminate />
    </div>
    <template v-else>
      <VCard class="my-8">
        <VCardTitle class="d-flex justify-space-between"
          >支払額<VBtn @click="showsAddPersonDialog = true"
            ><VIcon>mdi-account-plus</VIcon></VBtn
          >
        </VCardTitle>
        <VCardText>
          <div
            v-for="person in purchasePeople"
            :key="person._id"
            class="d-flex align-center"
          >
            <VTextField
              :label="person.name"
              :rules="[
                (v) => !isNaN(Number(v)) || '半角数字のみ入力してください',
                (v) => !/e|\.|-/.test(v) || '半角数字のみ入力してください',
                (v) => !v || v.length < 16 || '15桁以内で入力してください',
              ]"
              clearable
              counter="15"
              placeholder="0"
              suffix="円"
              v-model="person.paid"
            />
            <VBtn @click="deletePerson(person._id)"
              ><VIcon>mdi-account-minus</VIcon></VBtn
            >
          </div>
        </VCardText>
      </VCard>
      <VCard class="my-8">
        <VCardTitle class="d-flex justify-space-between"
          >割り勘金額<VBtn @click="showsAddPersonDialog = true"
            ><VIcon>mdi-account-plus</VIcon></VBtn
          ></VCardTitle
        >
        <VCardText>
          <div
            v-for="person in purchasePeople"
            :key="person._id"
            class="d-flex align-center"
          >
            <VTextField
              :label="person.name"
              :rules="[
                (v) => !isNaN(Number(v)) || '半角数字のみ入力してください',
                (v) => !/e|\.|-/.test(v) || '半角数字のみ入力してください',
                (v) => !v || v.length < 16 || '15桁以内で入力してください',
              ]"
              clearable
              counter="15"
              placeholder="0"
              suffix="円"
              v-model="person.toPay"
            />
            <VBtn @click="deletePerson(person._id)"
              ><VIcon>mdi-account-minus</VIcon></VBtn
            >
          </div>
        </VCardText>
      </VCard>
    </template>
    <VBtn
      color="green"
      :disabled="isValid === false || getIsLoading"
      @click="submit"
      >追加</VBtn
    >
  </VForm>
  <VSnackbar timeout="2000" v-model="showsPostedSnackbar"
    >未精算リストに追加しました。</VSnackbar
  >
</template>
