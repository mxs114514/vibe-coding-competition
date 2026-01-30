<script setup lang="ts">
import type { Recipe } from '@/types/recipe'

import { ref, computed, watch } from 'vue'

import { useRecipeStore } from '@/stores/recipe'

const props = defineProps<{
  recipe: Recipe
}>()

defineEmits<{
  'view-detail': []
  'add-to-table': []
  'favorite': []
}>()

const recipeStore = useRecipeStore()

const defaultImage = '/recipe-placeholder.png'
const imageLoaded = ref(false)
const imageError = ref(false)

// 判断是否有图片URL
const hasImage = computed(() => !!props.recipe.imageUrl)

// 检查是否已收藏
const isFavorited = computed(() => recipeStore.isFavorited(props.recipe.id))

// 监听 imageUrl 变化，重置加载状态
watch(() => props.recipe.imageUrl, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    imageLoaded.value = false
    imageError.value = false
  }
})

// 图片加载成功
function handleImageLoad() {
  imageLoaded.value = true
}

// 图片加载失败
function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <div class="recipe-card">
    <!-- 菜谱图片 -->
    <div class="recipe-image">
      <!-- 骨架屏/加载状态 -->
      <div v-if="!hasImage || (!imageLoaded && !imageError)" class="image-skeleton">
        <div class="skeleton-shimmer"></div>
        <div class="loading-icon">
          <svg class="w-12 h-12 animate-spin text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p class="text-sm text-gray-500 mt-2">图片生成中...</p>
        </div>
      </div>

      <!-- 实际图片 -->
      <img v-show="hasImage && imageLoaded && !imageError" :src="recipe.imageUrl || defaultImage" :alt="recipe.name"
        @load="handleImageLoad" @error="handleImageError" />

      <!-- 加载失败显示默认图片 -->
      <img v-if="imageError" :src="defaultImage" :alt="recipe.name" />
    </div>

    <!-- 菜谱信息 -->
    <div class="recipe-info">
      <h3 class="recipe-name">{{ recipe.name }}</h3>

      <div class="recipe-meta">
        <span class="meta-item">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ recipe.cookingTimeMinutes }}分钟
        </span>
        <span class="meta-item">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {{ recipe.difficultyName }}
        </span>
        <span class="meta-item">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          {{ recipe.cuisineName }}
        </span>
      </div>

      <!-- 食材状态 -->
      <div class="ingredients-status">
        <div v-if="recipe.ingredients.available.length > 0" class="status-item available">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>已有: {{recipe.ingredients.available.map(i => i.name).join('、')}}</span>
        </div>
        <div v-if="recipe.ingredients.needed.length > 0" class="status-item needed">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>需购买: {{recipe.ingredients.needed.map(i => i.name).join('、')}}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="recipe-actions">
        <button @click="$emit('view-detail')" class="action-btn primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          详情
        </button>
        <button @click="$emit('add-to-table')" class="action-btn secondary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          餐桌
        </button>
        <button @click="$emit('favorite')" class="action-btn icon-only" :class="{ 'favorited': isFavorited }">
          <!-- 实心星标（已收藏） -->
          <svg v-if="isFavorited" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <!-- 空心星标（未收藏） -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

:global(.dark) .recipe-card {
  background: #1f2937;
}

.recipe-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f3f4f6;
}

:global(.dark) .recipe-image {
  background: #374151;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 骨架屏样式 */
.image-skeleton {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.dark) .image-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.loading-icon {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:global(.dark) .loading-icon p {
  color: #9ca3af;
}

.recipe-info {
  padding: 1rem;
}

.recipe-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

:global(.dark) .recipe-name {
  color: #f9fafb;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

:global(.dark) .meta-item {
  color: #9ca3af;
}

.ingredients-status {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-item.available {
  color: #059669;
}

.status-item.needed {
  color: #dc2626;
}

:global(.dark) .status-item.available {
  color: #10b981;
}

:global(.dark) .status-item.needed {
  color: #ef4444;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  flex: 1;
  background: #f59e0b;
  color: white;
}

.action-btn.primary:hover {
  background: #d97706;
}

.action-btn.secondary {
  flex: 1;
  background: #e5e7eb;
  color: #374151;
}

.action-btn.secondary:hover {
  background: #d1d5db;
}

.action-btn.icon-only {
  padding: 0.5rem;
  background: #e5e7eb;
  color: #374151;
}

.action-btn.icon-only:hover {
  background: #fef3c7;
  color: #f59e0b;
}

.action-btn.icon-only.favorited {
  color: #f59e0b;
}

:global(.dark) .action-btn.secondary {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .action-btn.secondary:hover {
  background: #4b5563;
}

:global(.dark) .action-btn.icon-only {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .action-btn.icon-only:hover {
  background: #451a03;
  color: #f59e0b;
}
</style>
