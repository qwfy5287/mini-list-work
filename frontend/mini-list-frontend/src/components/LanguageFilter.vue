<template>
  <div class="language-filter">
    <div class="filter-label">语言筛选:</div>
    <div class="filter-buttons">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        :class="['filter-btn', { active: currentFilter === option.value }]"
        @click="$emit('change', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: 'all' | 'zh' | 'en'
  label: string
}

interface Props {
  currentFilter: 'all' | 'zh' | 'en'
}

interface Emits {
  (e: 'change', value: 'all' | 'zh' | 'en'): void
}

defineProps<Props>()
defineEmits<Emits>()

const filterOptions: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' }
]
</script>

<style scoped>
.language-filter {
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
  border-color: #007bff;
  color: #007bff;
}

.filter-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: #fff;
}

.filter-btn.active:hover {
  background: #0056b3;
  border-color: #0056b3;
}

@media (max-width: 768px) {
  .language-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .filter-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .filter-btn {
    flex: 1;
    text-align: center;
  }
}
</style>