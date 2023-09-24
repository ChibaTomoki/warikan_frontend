import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { Stage, usePurchasesStore } from '../stores/purchases'

const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const useInputPurchases = (stage: Stage) => {
  const { getPurchasePeople, getPurchases } = storeToRefs(usePurchasesStore())

  const selectedIdList = ref<string[]>([])
  const selectsAll = computed<boolean>(
    () =>
      selectedIdList.value.length ===
        getPurchases.value.filter(
          (x) => x.stage === stage || capitalizeFirstLetter(stage)
        ).length && !!selectedIdList.value.length
  )
  const selectedPurchases = computed<
    { _id: string; name: string; toPay: number }[]
  >(() =>
    getPurchasePeople.value.map((person) => ({
      _id: person._id,
      name: person.name,
      toPay: getPurchases.value
        .filter((x) => selectedIdList.value.includes(x._id))
        .reduce((previous, current) => {
          const target = current.people.find((x) => x._id === person._id)
          if (!target) return previous

          return previous + Number(target.toPay) - Number(target.paid)
        }, 0),
    }))
  )
  const showsPurchaseEditDialog = ref(false)
  const idToEditPurchase = ref<string>('')

  const toggleAllSelected = () => {
    if (selectsAll.value) selectedIdList.value = []
    else
      selectedIdList.value = getPurchases.value
        .filter(
          (purchase) => purchase.stage === stage || capitalizeFirstLetter(stage)
        )
        .map((purchase) => purchase._id)
  }
  const toggleSelected = (id: string) => {
    if (selectedIdList.value.includes(id))
      selectedIdList.value = selectedIdList.value.filter((x) => x !== id)
    else selectedIdList.value = [...selectedIdList.value, id]
  }
  const showEditPurchaseDialog = (id: string) => {
    showsPurchaseEditDialog.value = true
    idToEditPurchase.value = id
  }

  return {
    idToEditPurchase,
    selectedIdList,
    selectedPurchases,
    selectsAll,
    showEditPurchaseDialog,
    showsPurchaseEditDialog,
    toggleAllSelected,
    toggleSelected,
  }
}
