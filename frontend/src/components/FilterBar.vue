<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cuisine, Difficulty, TasteBase, SpiceLevel, CUISINE_NAMES, DIFFICULTY_NAMES, TASTE_BASE_NAMES, SPICE_LEVEL_NAMES } from '@/types/recipe'
import type { RecipeFilters } from '@/types/recipe'

const props = defineProps<{
  modelValue: RecipeFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: RecipeFilters]
}>()

const localFilters = ref<RecipeFilters>({ ...props.modelValue })

// 判断是否选择了辣口味，只有选择辣口味时才能选择辣度
const isSpicySelected = computed(() => {
  return localFilters.value.tasteBase?.includes(TasteBase.SPICY) ?? false
})

watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue }
  },
  { deep: true }
)

function updateFilters() {
  emit('update:modelValue', { ...localFilters.value })
}

function toggleTasteBase(taste: TasteBase) {
  if (!localFilters.value.tasteBase) {
    localFilters.value.tasteBase = []
  }
  const index = localFilters.value.tasteBase.indexOf(taste)
  if (index > -1) {
    localFilters.value.tasteBase.splice(index, 1)
    // 如果取消选择辣口味，同时清除辣度选择
    if (taste === TasteBase.SPICY) {
      localFilters.value.spiceLevel = undefined
    }
  } else {
    localFilters.value.tasteBase.push(taste)
  }
  updateFilters()
}

function clearFilters() {
  localFilters.value = {}
  updateFilters()
}
</script>

<template>
  <div class="filter-bar space-y-4">
    <!-- 菜系选择 -->
    <div class="filter-group">
      <label class="filter-label">菜系</label>
      <div class="filter-options">
        <button v-for="(name, value) in CUISINE_NAMES" :key="value"
          @click="localFilters.cuisine = Number(value); updateFilters()" :class="[
            'filter-btn',
            localFilters.cuisine === Number(value) ? 'active' : ''
          ]">
          {{ name }}
        </button>
      </div>
    </div>

    <!-- 口味选择 -->
    <div class="filter-group">
      <label class="filter-label">口味</label>
      <div class="filter-options">
        <button v-for="(name, value) in TASTE_BASE_NAMES" :key="value" @click="toggleTasteBase(Number(value))" :class="[
          'filter-btn',
          localFilters.tasteBase?.includes(Number(value)) ? 'active' : ''
        ]">
          {{ name }}
        </button>
      </div>
    </div>

    <!-- 辣度选择 -->
    <div class="filter-group">
      <label class="filter-label">
        辣度
        <span v-if="!isSpicySelected" class="text-xs text-gray-400 ml-2">(请先选择辣口味)</span>
      </label>
      <div class="filter-options">
        <button v-for="(name, value) in SPICE_LEVEL_NAMES" :key="value"
          @click="isSpicySelected && (localFilters.spiceLevel = Number(value), updateFilters())"
          :disabled="!isSpicySelected" :class="[
            'filter-btn',
            localFilters.spiceLevel === Number(value) ? 'active' : '',
            !isSpicySelected ? 'disabled' : ''
          ]">
          {{ name }}
        </button>
      </div>
    </div>

    <!-- 烹饪时间选择 -->
    <div class="filter-group">
      <label class="filter-label">烹饪时间</label>
      <div class="filter-options">
        <button @click="localFilters.maxCookingTime = 15; updateFilters()"
          :class="['filter-btn', localFilters.maxCookingTime === 15 ? 'active' : '']">
          15分钟内
        </button>
        <button @click="localFilters.maxCookingTime = 30; updateFilters()"
          :class="['filter-btn', localFilters.maxCookingTime === 30 ? 'active' : '']">
          30分钟内
        </button>
        <button @click="localFilters.maxCookingTime = 60; updateFilters()"
          :class="['filter-btn', localFilters.maxCookingTime === 60 ? 'active' : '']">
          60分钟内
        </button>
      </div>
    </div>

    <!-- 难度选择 -->
    <div class="filter-group">
      <label class="filter-label">难度</label>
      <div class="filter-options">
        <button v-for="(name, value) in DIFFICULTY_NAMES" :key="value"
          @click="localFilters.difficulty = Number(value); updateFilters()" :class="[
            'filter-btn',
            localFilters.difficulty === Number(value) ? 'active' : ''
          ]">
          {{ name }}
        </button>
      </div>
    </div>

    <!-- 清除筛选按钮 -->
    <div class="flex justify-end">
      <button @click="clearFilters"
        class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
        清除筛选
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

:global(.dark) .filter-bar {
  background: #1f2937;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

:global(.dark) .filter-label {
  color: #d1d5db;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.filter-btn.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

:global(.dark) .filter-btn {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

:global(.dark) .filter-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

:global(.dark) .filter-btn.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.filter-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #9ca3af;
}

.filter-btn.disabled:hover {
  border-color: #d1d5db;
  color: #9ca3af;
}

:global(.dark) .filter-btn.disabled {
  background: #374151;
  border-color: #4b5563;
  color: #6b7280;
}

:global(.dark) .filter-btn.disabled:hover {
  border-color: #4b5563;
  color: #6b7280;
}
</style>
