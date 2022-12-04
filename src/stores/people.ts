import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios, { AxiosResponse } from 'axios'
import { useLoadingStore } from '../stores/loading'

type Person = {
  _id: string
  name: string
}

export const usePeopleStore = defineStore('counter', () => {
  const people = ref<Person[]>([])
  const getPeople = computed<Person[]>(() => people.value)
  const { finishLoading, startLoading } = useLoadingStore()

  const fetchPeople = async () => {
    startLoading()
    const res: AxiosResponse<Person[]> = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/people`
    )
    people.value = res.data
    finishLoading()
  }
  const postPerson = async (name: string, _id?: string) => {
    startLoading()
    await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/people/`, {
      _id,
      name,
    })
    fetchPeople()
    finishLoading()
  }
  const deletePerson = async (id: string) => {
    startLoading()
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/people/${id}`)
    fetchPeople()
    finishLoading()
  }

  return { deletePerson, fetchPeople, getPeople, postPerson }
})
