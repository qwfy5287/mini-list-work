<template>
  <button 
    :class="['crawl-btn', { loading: isLoading }]"
    @click="handleCrawl"
    :disabled="isLoading"
  >
    <span class="crawl-icon" :class="{ spinning: isLoading }">🔍</span>
    <span class="crawl-text">
      {{ isLoading ? '正在抓取...' : '抓取新闻' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'success', message: string): void
  (e: 'error', message: string): void
}

const emit = defineEmits<Emits>()

const isLoading = ref(false)
const API_BASE = import.meta.env.VITE_API_BASE_URL+'/api'

async function handleCrawl() {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    const response = await fetch(`${API_BASE}/simple/crawl`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      emit('success', data.message || '抓取成功！')
    } else {
      emit('error', data.error || '抓取失败')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '抓取失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.crawl-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.crawl-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.crawl-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.crawl-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.crawl-icon.spinning {
  animation: spin 1s linear infinite;
}

.crawl-text {
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
  .crawl-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>