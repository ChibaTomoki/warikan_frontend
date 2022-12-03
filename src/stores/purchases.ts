import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios, { AxiosResponse } from 'axios'
import { useLoadingStore } from '../stores/loading'

type Stage = 'Unsettled' | 'Settled' | 'Archived'
interface Person {
  _id: string
  name: string
}
interface PurchasePerson extends Person {
  paid: number
  toPay: number
}
interface Purchase {
  _id: string
  name: string
  date: string
  note: string
  people: PurchasePerson[]
  stage: Stage
}

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref<Purchase[]>([])
  const getPurchases = computed<Purchase[]>(() => purchases.value)
  const getPurchasePeople = computed<PurchasePerson[]>(() => {
    const purchasePeopleMapper = new Map()
    getPurchases.value.forEach((purchase) => {
      purchase.people.forEach((person) => {
        purchasePeopleMapper.set(person._id, person)
      })
    })
    return Array.from(purchasePeopleMapper.values())
  })
  const { finishLoading, startLoading } = useLoadingStore()

  const fetchPurchases = async () => {
    startLoading()
    const res: AxiosResponse<Purchase[]> = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/purchases`
    )
    finishLoading()
    purchases.value = res.data
  }
  const postPurchase = async (
    name: string,
    date: string,
    note: string,
    people: Person[]
  ) => {
    startLoading()
    await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/purchases`, {
      date,
      name,
      note,
      people,
      stage: 'Unsettled',
    })
    await fetchPurchases()
    finishLoading()
  }
  const payPurchase = async (id: string) => {
    startLoading()
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/purchases/${id}`,
      {
        stage: 'Settled',
      }
    )
    await fetchPurchases()
    finishLoading()
  }
  const payPurchases = async (idList: string[]) => {
    startLoading()
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/purchases`, {
      idList,
      target: {
        stage: 'Settled',
      },
    })
    await fetchPurchases()
    finishLoading()
  }
  const archivePurchase = async (id: string) => {
    startLoading()
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/purchases/${id}`,
      {
        stage: 'Archived',
      }
    )
    await fetchPurchases()
    finishLoading()
  }
  const archivePurchases = async (idList: string[]) => {
    startLoading()
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/purchases`, {
      idList: idList,
      target: {
        stage: 'Archived',
      },
    })
    await fetchPurchases()
    finishLoading()
  }
  const repayPurchase = async (id: string) => {
    startLoading()
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/purchases/${id}`,
      {
        stage: 'Unsettled',
      }
    )
    await fetchPurchases()
    finishLoading()
  }
  const repayPurchases = async (idList: string[]) => {
    startLoading()
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/purchases`, {
      idList,
      target: {
        stage: 'Unsettled',
      },
    })
    await fetchPurchases()
    finishLoading()
  }
  const editPurchase = async (id: string, body: any) => {
    startLoading()
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/purchases/${id}`,
      body
    )
    await fetchPurchases()
    finishLoading()
  }

  return {
    archivePurchase,
    archivePurchases,
    editPurchase,
    fetchPurchases,
    getPurchasePeople,
    getPurchases,
    payPurchase,
    payPurchases,
    postPurchase,
    repayPurchase,
    repayPurchases,
  }
})
