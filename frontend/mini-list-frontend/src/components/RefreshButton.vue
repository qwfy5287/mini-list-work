<template>
  <button 
    :class="['refresh-btn', { loading: isLoading }]"
    @click="$emit('refresh')"
    :disabled="isLoading"
  >
    <span class="refresh-icon" :class="{ spinning: isLoading }">🔄</span>
    <span class="refresh-text">
      {{ isLoading ? '正在刷新...' : '刷新新闻' }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
}

interface Emits {
  (e: 'refresh'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.refresh-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

.refresh-text {
  white-space: nowrap;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .refresh-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>