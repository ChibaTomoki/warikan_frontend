<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useLoadingStore } from '../stores/loading'
import { Purchase, Purchaser, usePurchasesStore } from '../stores/purchases'

type Props = {
  isOpen: boolean
  purchaseId: string
}
type Emits = {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const { getPurchases } = storeToRefs(usePurchasesStore())
const { editPurchase } = usePurchasesStore()
const { getIsLoading } = storeToRefs(useLoadingStore())

const isValid = ref(null)
const formRef = ref<{
  validate: () => Promise<{
    valid: boolean
    errors: { id: string | number; errorMessages: string[] }[]
  }>
  reset: () => void
  resetValidation: () => void
}>()
const formValue = ref<Partial<Purchase> & { people: Purchaser[] }>({
  date: undefined,
  name: undefined,
  note: undefined,
  people: [],
  stage: 'unsettled',
})

const paidSum = computed<number>(() =>
  formValue.value.people.reduce(
    (paidSum, person) => paidSum + (person.paid ? Number(person.paid) : 0),
    0
  )
)
const toPaySum = computed<number>(() =>
  formValue.value.people.reduce(
    (toPaySum, person) => toPaySum + (person.toPay ? Number(person.toPay) : 0),
    0
  )
)

watch(
  () => props.isOpen,
  () => {
    const targetPurchase = getPurchases.value.find(
      (purchase) => purchase._id === props.purchaseId
    )
    if (!targetPurchase) return

    formValue.value = {
      ...targetPurchase,
      people: targetPurchase.people.map((person) => ({ ...person })),
    }
  }
)

const isNumber = (value: string): boolean => /^\d+$/.test(value)
const hasFirstZero = (value: string): boolean => /^0/.test(value)
const submit = async () => {
  const form = formRef.value
  if (!form) return

  await form.validate()
  if (isValid.value === false)
    throw new Error('押せないはずのボタンが押せています')

  try {
    if (!formValue.value.name) throw new Error('購入品が不正です')
    if (!formValue.value.date) throw new Error('日付が不正です')
    await editPurchase(props.purchaseId, {
      date: formValue.value.date,
      name: formValue.value.name,
      note: formValue.value.note ?? '',
      people: formValue.value.people.map((person) => ({
        ...person,
        paid: person.paid ? Number(person.paid) : 0,
        toPay: person.toPay ? Number(person.toPay) : 0,
      })),
      stage: formValue.value.stage,
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
    @update:model-value="() => emits('close')"
  >
    <VSheet class="pa-4">
      <VForm ref="formRef" v-model="isValid" @submit.prevent="submit">
        <VTextField
          clearable
          label="購入品"
          required
          :rules="[(v) => !!v || '必須項目です']"
          v-model="formValue.name"
        />
        <VTextField
          clearable
          label="購入日"
          required
          :rules="[(v) => !!v || '必須項目です']"
          type="date"
          v-model="formValue.date"
        />
        <VTextField clearable label="メモ" v-model="formValue.note" />
        <div v-if="getIsLoading" class="d-flex justify-center mt-16">
          <VProgressCircular indeterminate />
        </div>
        <template v-else>
          <VCard class="ma-2" elevation="4">
            <VCardTitle class="d-flex justify-space-between">支払額</VCardTitle>
            <VCardText>
              <div
                v-for="person in formValue.people"
                :key="person._id"
                class="d-flex align-center"
              >
                <!-- もう一つの方で入力があったときにバリデーションを走らせる -->
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
                      !v || v < 10 ** 15 || '文字数は15文字以下にしてください',
                    paidSum === toPaySum ||
                      '支払額と割勘金額の合計が一致していません',
                  ]"
                  clearable
                  inputmode="numeric"
                  placeholder="0"
                  suffix="円"
                  :model-value="person.paid"
                  @update:model-value="
                    (value) => {
                      person.paid = value
                      formRef?.validate()
                    }
                  "
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
                v-for="person in formValue.people"
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
                      !v || v < 10 ** 15 || '文字数は15文字以下にしてください',
                    paidSum === toPaySum ||
                      '支払額と割勘金額の合計が一致していません',
                  ]"
                  clearable
                  inputmode="numeric"
                  placeholder="0"
                  suffix="円"
                  :model-value="person.toPay"
                  @update:model-value="
                    (value) => {
                      person.toPay = value
                      formRef?.validate()
                    }
                  "
                />
              </div>
            </VCardText>
          </VCard>
        </template>
        <VBtn
          type="submit"
          color="green"
          :disabled="isValid === false || getIsLoading"
          >編集完了</VBtn
        >
        <VBtn @click="() => emits('close')">キャンセル</VBtn>
      </VForm>
    </VSheet>
  </VDialog>
</template>
