import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserIngredient, IngredientStatus, IngredientCategory } from '@/types/ingredient'
import * as ingredientApi from '@/api/ingredient'

export const useIngredientStore = defineStore('ingredient', () => {
  // 状态
  const ingredients = ref<UserIngredient[]>([])
  const loading = ref(false)
  const searchKeyword = ref('')
  const statusFilter = ref<IngredientStatus | undefined>(undefined)
  const categoryFilter = ref<IngredientCategory | undefined>(undefined)
  const editingId = ref<number | null>(null)
  const selectedIds = ref<Set<number>>(new Set())

  // 计算属性
  const filteredIngredients = computed(() => {
    let result = ingredients.value

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(keyword))
    }

    // 状态过滤
    if (statusFilter.value !== undefined) {
      result = result.filter((item) => item.status === statusFilter.value)
    }

    // 分类过滤
    if (categoryFilter.value !== undefined) {
      result = result.filter((item) => item.category === categoryFilter.value)
    }

    return result
  })

  const hasSelection = computed(() => selectedIds.value.size > 0)

  const selectedCount = computed(() => selectedIds.value.size)

  // 方法
  async function fetchIngredients() {
    try {
      loading.value = true
      // 改为获取全量数据，在前端进行筛选
      const response = await ingredientApi.getUserIngredients()
      if (response.success) {
        ingredients.value = response.data.list
      }
    } catch (error) {
      console.error('获取食材列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addIngredient(data: any) {
    try {
      loading.value = true
      const response = await ingredientApi.addUserIngredient(data)
      if (response.success) {
        await fetchIngredients()
        return response.data
      }
    } catch (error) {
      console.error('添加食材失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateIngredient(id: number, data: any) {
    try {
      loading.value = true
      const response = await ingredientApi.updateUserIngredient(id, data)
      if (response.success) {
        await fetchIngredients()
        return response.data
      }
    } catch (error) {
      console.error('更新食材失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteIngredient(id: number) {
    try {
      loading.value = true
      const response = await ingredientApi.deleteUserIngredient(id)
      if (response.success) {
        await fetchIngredients()
      }
    } catch (error) {
      console.error('删除食材失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function batchDeleteIngredients() {
    if (selectedIds.value.size === 0) return

    try {
      loading.value = true
      const ids = Array.from(selectedIds.value)
      const response = await ingredientApi.batchDeleteUserIngredients({ ids })
      if (response.success) {
        selectedIds.value.clear()
        await fetchIngredients()
      }
    } catch (error) {
      console.error('批量删除食材失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
  }

  function setStatusFilter(status: IngredientStatus | undefined) {
    statusFilter.value = status
  }

  function setCategoryFilter(category: IngredientCategory | undefined) {
    categoryFilter.value = category
  }

  function toggleSelection(id: number) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function toggleSelectAll() {
    if (selectedIds.value.size === filteredIngredients.value.length) {
      selectedIds.value.clear()
    } else {
      filteredIngredients.value.forEach((item) => {
        selectedIds.value.add(item.id)
      })
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function setEditingId(id: number | null) {
    editingId.value = id
  }

  return {
    // 状态
    ingredients,
    loading,
    searchKeyword,
    statusFilter,
    categoryFilter,
    editingId,
    selectedIds,
    // 计算属性
    filteredIngredients,
    hasSelection,
    selectedCount,
    // 方法
    fetchIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    batchDeleteIngredients,
    setSearchKeyword,
    setStatusFilter,
    setCategoryFilter,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    setEditingId,
  }
})
