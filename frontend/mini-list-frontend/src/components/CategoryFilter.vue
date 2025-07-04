<template>
  <div class="category-filter">
    <div class="filter-label">分类筛选:</div>
    <div class="filter-buttons">
      <button
        v-for="category in categories"
        :key="category"
        :class="['filter-btn', { active: currentCategory === category }]"
        @click="$emit('change', category)"
      >
        {{ getCategoryLabel(category) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  categories: string[]
  currentCategory: string
}

interface Emits {
  (e: 'change', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const categoryLabels: Record<string, string> = {
  'all': '全部',
  'general': '综合',
  'tech': '科技',
  'world': '国际',
  'politics': '政治',
  'finance': '财经',
  'test': '测试'
}

function getCategoryLabel(category: string): string {
  return categoryLabels[category] || category
}
</script>

<style scoped>
.category-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: #fff;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 60px;
}

.filter-btn:hover {
  border-color: #28a745;
  color: #28a745;
}

.filter-btn.active {
  border-color: #28a745;
  background: #28a745;
  color: #fff;
}

.filter-btn.active:hover {
  background: #1e7e34;
  border-color: #1e7e34;
}

@media (max-width: 768px) {
  .category-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .filter-buttons {
    width: 100%;
  }
  
  .filter-btn {
    flex-grow: 1;
    text-align: center;
  }
}
</style>