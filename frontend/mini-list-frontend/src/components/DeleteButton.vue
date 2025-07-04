<template>
  <button 
    :class="['delete-btn', { loading: isLoading }]"
    @click="handleDelete"
    :disabled="isLoading"
    :title="confirmMode ? '确认删除？再次点击确认' : '删除文章'"
  >
    <span class="delete-icon">{{ confirmMode ? '⚠️' : '🗑️' }}</span>
    <span class="delete-text">
      {{ isLoading ? '删除中...' : confirmMode ? '确认删除' : '删除' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  articleId: number
  articleTitle: string
}

interface Emits {
  (e: 'deleted', articleId: number): void
  (e: 'error', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)
const confirmMode = ref(false)
const API_BASE = 'http://localhost:3000/api'

let confirmTimeout: NodeJS.Timeout | null = null

async function handleDelete() {
  if (isLoading.value) return
  
  if (!confirmMode.value) {
    // 第一次点击，进入确认模式
    confirmMode.value = true
    
    // 3秒后自动退出确认模式
    confirmTimeout = setTimeout(() => {
      confirmMode.value = false
    }, 3000)
    
    return
  }
  
  // 第二次点击，执行删除
  if (confirmTimeout) {
    clearTimeout(confirmTimeout)
    confirmTimeout = null
  }
  
  try {
    isLoading.value = true
    
    const response = await fetch(`${API_BASE}/delete/article/${props.articleId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      emit('deleted', props.articleId)
    } else {
      emit('error', data.error || '删除失败')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '删除失败')
  } finally {
    isLoading.value = false
    confirmMode.value = false
  }
}
</script>

<style scoped>
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  opacity: 0.8;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
  opacity: 1;
  transform: translateY(-1px);
}

.delete-btn.loading {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.delete-icon {
  font-size: 0.8rem;
}

.delete-text {
  white-space: nowrap;
  font-size: 0.7rem;
}

/* 确认模式样式 */
.delete-btn:not(.loading):not(:disabled) {
  animation: none;
}

.delete-btn:not(.loading):not(:disabled):hover {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    box-shadow: 0 0 5px rgba(220, 53, 69, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.8);
  }
}

@media (max-width: 768px) {
  .delete-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }
  
  .delete-text {
    font-size: 0.65rem;
  }
}
</style>