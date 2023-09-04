<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePurchasesStore } from '../stores/purchases'
import { useLoadingStore } from '../stores/loading'
import PurchaseEditDialog from './PurchaseEditDialog.vue'
import { useInputPurchases } from '../composables/InputPurchases'

const { archivePurchases, payPurchases } = usePurchasesStore()
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
} = useInputPurchases('unsettled')
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
      <VBtn elevation="2" @click="() => payPurchases(selectedIdList)"
        ><VIcon>mdi-check</VIcon>精算</VBtn
      >
      <VBtn elevation="2" @click="() => archivePurchases(selectedIdList)"
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
        <th class="pa-0">
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
        <td class="pa-0">
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
              (previous, current) => previous + Number(current.paid),
              0
            )
          }}
        </td>
        <td>
          <VBtn @click="() => showEditPurchaseDialog(purchase._id)"
            ><VIcon>mdi-square-edit-outline</VIcon>編集</VBtn
          >
        </td>
      </tr>
    </tbody>
  </VTable>
  <PurchaseEditDialog
    :isOpen="showsPurchaseEditDialog"
    :purchaseId="idToEditPurchase"
    @close="showsPurchaseEditDialog = false"
  />
</template>
