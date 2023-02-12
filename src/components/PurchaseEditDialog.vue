<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
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
  paid: string | null
  toPay: string | null
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const { getPurchases } = storeToRefs(usePurchasesStore())
const { editPurchase } = usePurchasesStore()
const { getIsLoading } = storeToRefs(useLoadingStore())

let targetPurchase = getPurchases.value.find(
  (purchase) => purchase._id === props.purchaseId
)
const isValid = ref(null)
const formRef = ref<{
  validate: () => Promise<void>
  reset: () => Promise<void>
}>()
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

const paidSum = computed<number>(() =>
  purchasePeople.value.reduce(
    (paidSum, person) => paidSum + (person.paid ? Number(person.paid) : 0),
    0
  )
)
const toPaySum = computed<number>(() =>
  purchasePeople.value.reduce(
    (toPaySum, person) => toPaySum + (person.toPay ? Number(person.toPay) : 0),
    0
  )
)

watch(
  () => props.isOpen,
  () => {
    targetPurchase = getPurchases.value.find(
      (purchase) => purchase._id === props.purchaseId
    )
    if (!targetPurchase) return

    name.value = targetPurchase.name
    date.value = targetPurchase.date
    note.value = targetPurchase.note
    // 同じ購入品のダイアログを開きなおしたときに前回の値を引き継がないようにするため(オブジェクトの参照を渡してしまうと引き継いでしまう)
    purchasePeople.value = targetPurchase.people.map((x) => ({ ...x }))
    stage.value = targetPurchase.stage
  }
)

const isNumber = (value: string): boolean => /^\d+$/.test(value)
const hasFirstZero = (value: string): boolean => /^0/.test(value)
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
                    (v) =>
                      !v || isNumber(v) || '半角数字のみを入力してください',
                    (v) =>
                      !v ||
                      v.length === 1 ||
                      !hasFirstZero(v ?? '0') ||
                      '先頭は0以外の数字を入力してください',
                    (v) =>
                      !v || v.length < 16 || '文字数は15文字以下にしてください',
                    paidSum === toPaySum ||
                      '支払額と割勘金額の合計が一致していません',
                  ]"
                  clearable
                  inputmode="numeric"
                  placeholder="0"
                  suffix="円"
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
                    (v) =>
                      !v || isNumber(v) || '半角数字のみを入力してください',
                    (v) =>
                      !v ||
                      v.length === 1 ||
                      !hasFirstZero(v ?? '0') ||
                      '先頭は0以外の数字を入力してください',
                    (v) =>
                      !v || v.length < 16 || '文字数は15文字以下にしてください',
                    paidSum === toPaySum ||
                      '支払額と割勘金額の合計が一致していません',
                  ]"
                  clearable
                  inputmode="numeric"
                  placeholder="0"
                  suffix="円"
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
