<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeopleStore } from '../stores/people'
import { usePurchasesStore } from '../stores/purchases'
import { useLoadingStore } from '../stores/loading'

type Person = {
  _id: string | null
  name: string
}
type PurchasePersonForInput = Person & {
  _id: string
  paid: number | null
  toPay: number | null
}

const { deletePerson, fetchPeople, postPerson } = usePeopleStore()
const { getPeople } = storeToRefs(usePeopleStore())
const { fetchPurchases, postPurchase } = usePurchasesStore()
const { getPurchasePeople } = storeToRefs(usePurchasesStore())
const { getIsLoading } = storeToRefs(useLoadingStore())
const formRef = ref<{
  validate: () => Promise<void>
  reset: () => Promise<void>
  resetValidation: () => Promise<void>
}>()
const addPersonFormRef = ref<{
  validate: () => Promise<void>
}>()
const canSubmit = ref<boolean | null>(null)
const canSubmitToAddPerson = ref<boolean | null>(null)
const name = ref<string | null>(null)
const today = new Date()
const todayAsString = `${today.getFullYear()}-${(
  '0' +
  (today.getMonth() + 1)
).slice(-2)}-${('0' + today.getDate()).slice(-2)}`
const date = ref<string | null>(todayAsString)
const note = ref<string | null>(null)
const purchasePeople = ref<PurchasePersonForInput[]>([])
const showsPostedSnackbar = ref(false)
const showsAddPersonDialog = ref(false)
const personToAdd = ref<Person>({ _id: null, name: '' })

const paidSum = computed<number>(() =>
  purchasePeople.value.reduce(
    (paidSum, person) => paidSum + (person.paid ?? 0),
    0
  )
)
const toPaySum = computed<number>(() =>
  purchasePeople.value.reduce(
    (toPaySum, person) => toPaySum + (person.toPay ?? 0),
    0
  )
)
/** 払うべき額の合計を等分した値 */
const aliquotToPay = computed<number>(() =>
  Math.floor(paidSum.value / purchasePeople.value.length)
)
/** 払うべき額の合計を等分して出た余りの値 */
const remainderToPay = computed<number>(
  () => paidSum.value - aliquotToPay.value * purchasePeople.value.length
)

watchEffect(() => {
  purchasePeople.value = getPeople.value.map((person) => ({
    _id: person._id,
    name: person.name,
    paid: 0,
    toPay: 0,
  }))
})

watch(showsAddPersonDialog, () => {
  if (showsAddPersonDialog.value) personToAdd.value = { _id: null, name: '' }
})

const addPurchase = async () => {
  const form = formRef.value
  if (!form) return

  await form.validate()
  if (canSubmit.value === false) return
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
    date.value = todayAsString
  } catch (error) {
    console.log(error)
  }
}
const addPerson = async () => {
  const form = addPersonFormRef.value
  if (!form) return

  await form.validate()
  if (canSubmitToAddPerson.value === false) return

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
const format = (value: string): string => {
  if (!value) return '0'
  return [...value]
    .filter((char: string) => char.match(/\d/))
    .reduce((previous: string, current: string) => {
      if ((previous + current).match(/^0\d/)) return current
      if ((previous + current).match(/^\d{16}/)) return previous
      return previous + current
    }, '')
}
const inputPaid = (id: string, value: string) => {
  const target = purchasePeople.value.find((person) => person._id === id)
  if (!target) return

  target.paid = Number(format(value))

  let remainder = remainderToPay.value
  purchasePeople.value.forEach((person, index) => {
    const remainingPeopleNum = purchasePeople.value.length - index
    const OneOrZero = Math.random() < remainder / remainingPeopleNum ? 1 : 0
    if (OneOrZero) remainder--
    person.toPay = aliquotToPay.value + OneOrZero
  })

  if (!formRef.value) return
  formRef.value.resetValidation()
}
const inputToPay = (id: string, value: string) => {
  const target = purchasePeople.value.find((person) => person._id === id)
  if (!target) return

  target.toPay = Number(format(value))

  if (!formRef.value) return
  formRef.value.resetValidation()
}

fetchPeople()
fetchPurchases()
</script>

<template>
  <VForm v-model="canSubmit" ref="formRef">
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
              :hint="String(person.paid)"
              :label="person.name"
              :model-value="person.paid"
              @update:model-value="(value) => inputPaid(person._id, value)"
              clearable
              counter="15"
              placeholder="0"
              suffix="円"
            />
            <VBtn @click="deletePerson(person._id)"
              ><VIcon>mdi-account-minus</VIcon></VBtn
            >
          </div>
        </VCardText>
      </VCard>
      <VCard class="my-8">
        <VCardTitle class="d-flex justify-space-between"
          >割勘金額<VBtn @click="showsAddPersonDialog = true"
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
              :hint="String(person.toPay)"
              :label="person.name"
              :model-value="person.toPay"
              :rules="[
                paidSum === toPaySum ||
                  '支払額と割勘金額の合計が一致していません',
              ]"
              @update:model-value="(value) => inputToPay(person._id, value)"
              clearable
              counter="15"
              placeholder="0"
              suffix="円"
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
      :disabled="canSubmit === false || getIsLoading"
      @click="addPurchase"
      >追加</VBtn
    >
  </VForm>
  <VDialog v-model="showsAddPersonDialog">
    <VForm v-model="canSubmitToAddPerson" ref="addPersonFormRef">
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
            :rules="[
              (v) => !!v || '必須項目です',
              (v) =>
                !getPeople.some((person) => person.name === v) ||
                '同じ名前の人は登録できません',
            ]"
          />
        </VCardText>
        <VCardActions
          ><VBtn
            :disabled="canSubmitToAddPerson === false || getIsLoading"
            @click="addPerson"
            >追加</VBtn
          ><VBtn @click="showsAddPersonDialog = false"
            >キャンセル</VBtn
          ></VCardActions
        >
      </VCard>
    </VForm>
  </VDialog>
  <VSnackbar timeout="2000" v-model="showsPostedSnackbar"
    >未精算リストに追加しました。</VSnackbar
  >
</template>
