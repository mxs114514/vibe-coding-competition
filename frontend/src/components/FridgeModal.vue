<!-- 冰箱食材管理遮罩层 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { useIngredientStore } from '@/stores/ingredient'
import { useNavigationStore } from '@/stores/navigation'
import { IngredientCategory, IngredientStatus } from '@/types/ingredient'

const navigationStore = useNavigationStore()
const ingredientStore = useIngredientStore()

// 表单相关
const showAddForm = ref(false)
const showEditForm = ref(false)
const formData = ref({
  ingredientId: 0,
  name: '',
  amount: 1,
  unit: '',
  status: IngredientStatus.AVAILABLE,
  category: IngredientCategory.VEGETABLE
})

// 搜索处理
const handleSearch = (keyword: string) => {
  ingredientStore.setSearchKeyword(keyword)
}

// 筛选处理
const handleStatusFilter = (status: IngredientStatus | undefined) => {
  ingredientStore.setStatusFilter(status)
}

const handleCategoryFilter = (category: IngredientCategory | undefined) => {
  ingredientStore.setCategoryFilter(category)
}

// 添加食材
const openAddForm = () => {
  formData.value = {
    ingredientId: 0,
    name: '',
    amount: 1,
    unit: '个',
    status: IngredientStatus.AVAILABLE,
    category: IngredientCategory.VEGETABLE
  }
  showAddForm.value = true
}

const handleAdd = async () => {
  try {
    await ingredientStore.addIngredient({
      ingredientId: formData.value.ingredientId || Date.now(),
      amount: formData.value.amount,
      unit: formData.value.unit,
      status: formData.value.status
    })
    showAddForm.value = false
  } catch (error) {
    alert('添加失败，请重试')
  }
}

// 编辑食材
const openEditForm = (ingredient: any) => {
  formData.value = {
    ingredientId: ingredient.id,
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    status: ingredient.status,
    category: ingredient.category
  }
  ingredientStore.setEditingId(ingredient.id)
  showEditForm.value = true
}

const handleEdit = async () => {
  try {
    await ingredientStore.updateIngredient(formData.value.ingredientId, {
      amount: formData.value.amount,
      unit: formData.value.unit,
      status: formData.value.status
    })
    showEditForm.value = false
    ingredientStore.setEditingId(null)
  } catch (error) {
    alert('更新失败，请重试')
  }
}

// 删除食材
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个食材吗？')) return
  try {
    await ingredientStore.deleteIngredient(id)
  } catch (error) {
    alert('删除失败，请重试')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${ingredientStore.selectedCount} 个食材吗？`)) return
  try {
    await ingredientStore.batchDeleteIngredients()
  } catch (error) {
    alert('批量删除失败，请重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  ingredientStore.fetchIngredients()
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/70 transition-opacity" @click="navigationStore.closeModal()"></div>

    <!-- 遮罩层内容 -->
    <div
      class="relative bg-white dark:bg-gray-800 w-full md:w-4/5 lg:w-3/5 max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in overflow-hidden flex flex-col">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">🧊 冰箱食材管理</h2>
        <button @click="navigationStore.closeModal()"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 搜索和筛选栏 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <!-- 搜索框 -->
        <div class="relative">
          <input type="text" :value="ingredientStore.searchKeyword"
            @input="handleSearch(($event.target as HTMLInputElement).value)" placeholder="搜索食材..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- 筛选按钮组 -->
        <div class="flex flex-wrap gap-2">
          <!-- 状态筛选 -->
          <button @click="handleStatusFilter(undefined)"
            :class="[ingredientStore.statusFilter === undefined ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors">
            全部
          </button>
          <button @click="handleStatusFilter(IngredientStatus.AVAILABLE)"
            :class="[ingredientStore.statusFilter === IngredientStatus.AVAILABLE ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors">
            已有
          </button>
          <button @click="handleStatusFilter(IngredientStatus.NEEDED)"
            :class="[ingredientStore.statusFilter === IngredientStatus.NEEDED ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors">
            缺少
          </button>

          <!-- 分类筛选 -->
          <select :value="ingredientStore.categoryFilter"
            @change="handleCategoryFilter(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : undefined)"
            class="px-3 py-1 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <option :value="undefined">全部分类</option>
            <option :value="IngredientCategory.VEGETABLE">🥬 蔬菜</option>
            <option :value="IngredientCategory.MEAT">🥩 肉类</option>
            <option :value="IngredientCategory.SEAFOOD">🦐 海鲜</option>
            <option :value="IngredientCategory.STAPLE">🍚 主食</option>
            <option :value="IngredientCategory.SEASONING">🧂 调味料</option>
          </select>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              :checked="ingredientStore.selectedCount === ingredientStore.filteredIngredients.length && ingredientStore.filteredIngredients.length > 0"
              @change="ingredientStore.toggleSelectAll()"
              class="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
            <span class="text-sm text-gray-600 dark:text-gray-400">全选</span>
          </label>
          <button v-if="ingredientStore.hasSelection" @click="handleBatchDelete"
            class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            删除选中 ({{ ingredientStore.selectedCount }})
          </button>
        </div>
        <button @click="openAddForm"
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加食材
        </button>
      </div>

      <!-- 食材列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 加载状态 -->
        <div v-if="ingredientStore.loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="ingredientStore.filteredIngredients.length === 0"
          class="text-center text-gray-600 dark:text-gray-400 py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-medium">暂无食材</p>
          <p class="text-sm mt-2">点击"添加食材"按钮开始管理您的冰箱</p>
        </div>

        <!-- 食材列表 -->
        <div v-else class="space-y-3">
          <div v-for="ingredient in ingredientStore.filteredIngredients" :key="ingredient.id"
            class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <!-- 复选框 -->
            <input type="checkbox" :checked="ingredientStore.selectedIds.has(ingredient.id)"
              @change="ingredientStore.toggleSelection(ingredient.id)"
              class="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />

            <!-- 食材信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ ingredient.name }}</h3>
                <span
                  class="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {{ ingredient.categoryName }}
                </span>
                <span :class="[
                  ingredient.status === IngredientStatus.AVAILABLE
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                ]" class="px-2 py-0.5 text-xs rounded-full">
                  {{ ingredient.statusName }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                数量: {{ ingredient.amount }} {{ ingredient.unit }}
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2">
              <button @click="openEditForm(ingredient)"
                class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                title="编辑">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="handleDelete(ingredient.id)"
                class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title="删除">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加食材表单 -->
      <div v-if="showAddForm" class="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">添加食材</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">食材名称</label>
              <input v-model="formData.name" type="text" placeholder="请输入食材名称"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">数量</label>
                <input v-model.number="formData.amount" type="number" min="0" step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">单位</label>
                <input v-model="formData.unit" type="text" placeholder="个/斤/袋"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
              <select v-model.number="formData.status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100">
                <option :value="IngredientStatus.AVAILABLE">已有</option>
                <option :value="IngredientStatus.NEEDED">缺少</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showAddForm = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              取消
            </button>
            <button @click="handleAdd"
              class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              确定
            </button>
          </div>
        </div>
      </div>

      <!-- 编辑食材表单 -->
      <div v-if="showEditForm" class="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">编辑食材</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">食材名称</label>
              <input v-model="formData.name" type="text" disabled
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">数量</label>
                <input v-model.number="formData.amount" type="number" min="0" step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">单位</label>
                <input v-model="formData.unit" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
              <select v-model.number="formData.status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100">
                <option :value="IngredientStatus.AVAILABLE">已有</option>
                <option :value="IngredientStatus.NEEDED">缺少</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showEditForm = false; ingredientStore.setEditingId(null)"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              取消
            </button>
            <button @click="handleEdit"
              class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
