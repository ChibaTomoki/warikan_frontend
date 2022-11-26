<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { usePurchasesStore } from '../stores/purchases'
import { useLoadingStore } from '../stores/loading'

const {
  archivePurchase,
  archivePurchases,
  fetchPurchases,
  payPurchase,
  payPurchases,
} = usePurchasesStore()
const { getPurchasePeople, getPurchases } = storeToRefs(usePurchasesStore())
const { getIsLoading } = storeToRefs(useLoadingStore())
const selectedIdList = ref<string[]>([])
const isSelectedAll = computed<boolean>(
  () => selectedIdList.value.length === getPurchases.value.length
)
const selectedToPays = computed<{ _id: string; name: string; toPay: number }[]>(
  () =>
    getPurchasePeople.value.map((person) => ({
      _id: person._id,
      name: person.name,
      toPay: getPurchases.value
        .filter((x) => selectedIdList.value.includes(x._id))
        .reduce((previous, current) => {
          const target = current.people.find((x) => x._id === person._id)
          if (!target) return previous
          return previous + target.toPay - target.paid
        }, 0),
    }))
)

const onChangeAll = () => {
  if (isSelectedAll.value) selectedIdList.value = []
  else selectedIdList.value = getPurchases.value.map((purchase) => purchase._id)
}
const onChange = (id: string) => {
  if (selectedIdList.value.includes(id))
    selectedIdList.value = selectedIdList.value.filter((x) => x !== id)
  else selectedIdList.value = [...selectedIdList.value, id]
}

fetchPurchases()
</script>

<template>
  <VCard>
    <VCardTitle>選択中の購入品の精算額</VCardTitle>
    <VCardText>
      <div
        class="ma-4"
        v-for="selectedToPay in selectedToPays"
        :key="selectedToPay._id"
      >
        <template v-if="selectedToPay.toPay < 0">
          <span style="font-size: 130%">{{ selectedToPay.name }}</span>
          <span>の</span>
          <span style="font-size: 130%">受取る額：</span>
          <span style="font-size: 130%">{{ -selectedToPay.toPay }}</span> 円
        </template>
        <template v-else>
          <span style="font-size: 130%">{{ selectedToPay.name }}</span>
          <span>の</span>
          <span style="font-size: 130%">支払う額：</span>
          <span style="font-size: 130%">{{ selectedToPay.toPay }}</span> 円
        </template>
      </div>
    </VCardText>
    <VCardActions>
      <VBtn elevation="2" @click="payPurchases(selectedIdList)"
        ><VIcon>mdi-check</VIcon>精算</VBtn
      >
      <VBtn elevation="2" @click="archivePurchases(selectedIdList)"
        ><VIcon>mdi-delete</VIcon>削除</VBtn
      >
    </VCardActions>
  </VCard>
  <div v-if="getIsLoading" class="d-flex justify-center mt-16">
    <VProgressCircular indeterminate />
  </div>
  <VTable v-else>
    <thead>
      <tr>
        <th>
          <VCheckboxBtn
            :modelValue="isSelectedAll"
            @update:modelValue="onChangeAll"
          />
        </th>
        <th>購入品</th>
        <th>合計金額</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="purchase in getPurchases" :key="purchase._id">
        <template v-if="purchase.stage === 'Unsettled'">
          <td>
            <VCheckboxBtn
              :modelValue="selectedIdList"
              @update:modelValue="onChange(purchase._id)"
              :value="purchase._id"
            />
          </td>
          <td>{{ purchase.name }}</td>
          <td>
            {{
              purchase.people.reduce(
                (previous, current) => previous + current.paid,
                0
              )
            }}
          </td>
          <td>
            <VBtn @click="payPurchase(purchase._id)"
              ><VIcon>mdi-check</VIcon>精算</VBtn
            >
            <VBtn><VIcon>mdi-square-edit-outline</VIcon>編集</VBtn>
            <VBtn @click="archivePurchase(purchase._id)"
              ><VIcon>mdi-delete</VIcon>削除</VBtn
            >
          </td>
        </template>
      </tr>
    </tbody>
  </VTable>
</template>
