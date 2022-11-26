import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const loadingStack = ref(0)
  const getIsLoading = computed<boolean>(() => loadingStack.value > 0)
  const startLoading = () => {
    loadingStack.value++
  }
  const finishLoading = () => {
    loadingStack.value--
  }

  return { finishLoading, getIsLoading, startLoading }
})
