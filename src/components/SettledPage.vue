<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePurchasesStore } from '../stores/purchases'
import { useLoadingStore } from '../stores/loading'
import PurchaseEditDialog from './PurchaseEditDialog.vue'
import { useInputPurchases } from './InputPurchases'

const {
  archivePurchase,
  archivePurchases,
  fetchPurchases,
  repayPurchase,
  repayPurchases,
} = usePurchasesStore()
const { getPurchases } = storeToRefs(usePurchasesStore())
const { getIsLoading } = storeToRefs(useLoadingStore())

const {
  idToEditPurchase,
  selectedIdList,
  selectedPurchases,
  selectsAll,
  showEditPurchaseDialog,
  showsPurchaseEditDialog,
  toggleAllSelected,
  toggleSelected,
} = useInputPurchases('Settled')

fetchPurchases()
</script>

<template>
  <VCard class="ma-2" elevation="4">
    <VCardTitle>選択中の購入品の精算額</VCardTitle>
    <VCardText>
      <div
        class="ma-4"
        v-for="selectedPurchase in selectedPurchases"
        :key="selectedPurchase._id"
      >
        <template v-if="selectedPurchase.toPay < 0">
          <span style="font-size: 1.3rem">{{ selectedPurchase.name }}</span>
          <span>の</span>
          <span style="font-size: 1.3rem">受取る額：</span>
          <span style="font-size: 1.3rem">{{ -selectedPurchase.toPay }}</span>
          円
        </template>
        <template v-else>
          <span style="font-size: 1.3rem">{{ selectedPurchase.name }}</span>
          <span>の</span>
          <span style="font-size: 1.3rem">支払う額：</span>
          <span style="font-size: 1.3rem">{{ selectedPurchase.toPay }}</span> 円
        </template>
      </div>
    </VCardText>
    <VCardActions>
      <VBtn elevation="2" @click="repayPurchases(selectedIdList)"
        ><VIcon>mdi-check-outline</VIcon>精算前に戻す</VBtn
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
            :modelValue="selectsAll"
            @update:modelValue="toggleAllSelected"
          />
        </th>
        <th>購入品</th>
        <th>購入日</th>
        <th>合計金額</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="purchase in getPurchases" :key="purchase._id">
        <template v-if="purchase.stage === 'Settled'">
          <td>
            <VCheckboxBtn
              :modelValue="selectedIdList"
              @update:modelValue="toggleSelected(purchase._id)"
              :value="purchase._id"
            />
          </td>
          <td>{{ purchase.name }}</td>
          <td>{{ purchase.date }}</td>
          <td>
            {{
              purchase.people.reduce(
                (previous, current) => previous + current.paid,
                0
              )
            }}
          </td>
          <td>
            <VBtn @click="repayPurchase(purchase._id)"
              ><VIcon>mdi-check-outline</VIcon>精算前に戻す</VBtn
            >
            <VBtn @click="showEditPurchaseDialog(purchase._id)"
              ><VIcon>mdi-square-edit-outline</VIcon>編集</VBtn
            >
            <VBtn @click="archivePurchase(purchase._id)"
              ><VIcon>mdi-delete</VIcon>削除</VBtn
            >
          </td>
        </template>
      </tr>
    </tbody>
  </VTable>
  <PurchaseEditDialog
    :isOpen="showsPurchaseEditDialog"
    :purchaseId="idToEditPurchase"
    @close="showsPurchaseEditDialog = false"
  />
</template>
