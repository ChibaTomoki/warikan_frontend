<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'
import { useLoadingStore } from '../stores/loading'
import { usePurchasesStore } from '../stores/purchases'

type Props = {
  isOpen: boolean
  purchaseId: string
}
type Emits = {
  (e: 'close'): void
}

type Stage = 'Unsettled' | 'Settled' | 'Archived'
type Person = {
  _id: string | null
  name: string
}
type PurchasePerson = Person & {
  _id: string
  paid: number
  toPay: number
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const { getPurchases } = storeToRefs(usePurchasesStore())
const { editPurchase } = usePurchasesStore()
const { getIsLoading } = storeToRefs(useLoadingStore())

const isValid = ref(null)
const formRef = ref<{
  validate: () => Promise<void>
  reset: () => Promise<void>
}>()
// watchEffectと重複している可能性あり
const targetPurchase = ref(
  getPurchases.value.find((purchase) => purchase._id === props.purchaseId)
)
const name = ref<string | null>(null)
const today = new Date()
const todayAsString = `${today.getFullYear()}-${(
  '0' +
  (today.getMonth() + 1)
).slice(-2)}-${('0' + today.getDate()).slice(-2)}`
const date = ref<string | null>(todayAsString)
const note = ref<string | null>(null)
const purchasePeople = ref<PurchasePerson[]>([])
const stage = ref<Stage>('Unsettled')

watchEffect(() => {
  targetPurchase.value = getPurchases.value.find(
    (purchase) => purchase._id === props.purchaseId
  )
  if (!targetPurchase.value) return

  name.value = targetPurchase.value.name
  date.value = targetPurchase.value.date
  note.value = targetPurchase.value.note
  purchasePeople.value = targetPurchase.value.people
  stage.value = targetPurchase.value.stage
})

const submit = async () => {
  const form = formRef.value
  if (!form) return

  await form.validate()
  if (isValid.value === false) return

  try {
    if (!name.value) throw '購入品が不正です'
    if (!date.value) throw '日付が不正です'
    await editPurchase(props.purchaseId, {
      date: date.value,
      name: name.value,
      note: note.value ?? '',
      people: purchasePeople.value.map((person) => ({
        ...person,
        paid: person.paid ? Number(person.paid) : 0,
        toPay: person.toPay ? Number(person.toPay) : 0,
      })),
      stage: stage.value,
    })
    emits('close')
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <VDialog
    class="ma-4"
    :model-value="isOpen"
    @update:model-value="emits('close')"
  >
    <VSheet class="pa-4">
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
        <div v-if="getIsLoading" class="d-flex justify-center mt-16">
          <VProgressCircular indeterminate />
        </div>
        <template v-else>
          <VCard class="ma-2" elevation="4">
            <VCardTitle class="d-flex justify-space-between">支払額</VCardTitle>
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
                    (v) =>
                      !v ||
                      String(v).length < 16 ||
                      '15桁以内で入力してください',
                  ]"
                  clearable
                  placeholder="0"
                  suffix="円"
                  type="number"
                  v-model="person.paid"
                />
              </div>
            </VCardText>
          </VCard>
          <VCard class="ma-2" elevation="4">
            <VCardTitle class="d-flex justify-space-between"
              >割り勘金額</VCardTitle
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
                    (v) =>
                      !v ||
                      String(v).length < 16 ||
                      '15桁以内で入力してください',
                  ]"
                  clearable
                  placeholder="0"
                  suffix="円"
                  type="number"
                  v-model="person.toPay"
                />
              </div>
            </VCardText>
          </VCard>
        </template>
        <VBtn
          color="green"
          :disabled="isValid === false || getIsLoading"
          @click="submit"
          >編集完了</VBtn
        >
        <VBtn @click="emits('close')">キャンセル</VBtn>
      </VForm>
    </VSheet>
  </VDialog>
</template>
