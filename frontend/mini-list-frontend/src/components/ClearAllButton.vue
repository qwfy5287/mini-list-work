<template>
  <button 
    :class="['clear-all-btn', { 
      loading: isLoading,
      confirm: confirmMode,
      'final-confirm': finalConfirmMode 
    }]"
    @click="handleClearAll"
    :disabled="isLoading"
    :title="getButtonTitle()"
  >
    <span class="clear-icon">{{ getIcon() }}</span>
    <span class="clear-text">{{ getButtonText() }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'success', message: string, stats: any): void
  (e: 'error', message: string): void
}

const emit = defineEmits<Emits>()

const isLoading = ref(false)
const confirmMode = ref(false)
const finalConfirmMode = ref(false)
const API_BASE = 'http://localhost:3000/api'

let confirmTimeout: NodeJS.Timeout | null = null
let finalTimeout: NodeJS.Timeout | null = null

function getIcon() {
  if (isLoading.value) return '⏳'
  if (finalConfirmMode.value) return '💀'
  if (confirmMode.value) return '⚠️'
  return '🧹'
}

function getButtonText() {
  if (isLoading.value) return '清空中...'
  if (finalConfirmMode.value) return '确认清空'
  if (confirmMode.value) return '再次点击确认'
  return '清空所有'
}

function getButtonTitle() {
  if (finalConfirmMode.value) return '最后确认：将删除所有文章！'
  if (confirmMode.value) return '确认清空所有文章？再次点击确认'
  return '清空数据库中的所有文章'
}

function resetConfirmState() {
  confirmMode.value = false
  finalConfirmMode.value = false
  if (confirmTimeout) {
    clearTimeout(confirmTimeout)
    confirmTimeout = null
  }
  if (finalTimeout) {
    clearTimeout(finalTimeout)
    finalTimeout = null
  }
}

async function handleClearAll() {
  if (isLoading.value) return
  
  if (!confirmMode.value) {
    // 第一次点击 - 进入确认模式
    confirmMode.value = true
    
    confirmTimeout = setTimeout(() => {
      resetConfirmState()
    }, 4000) // 4秒后重置
    
    return
  }
  
  if (!finalConfirmMode.value) {
    // 第二次点击 - 进入最终确认模式
    finalConfirmMode.value = true
    
    if (confirmTimeout) {
      clearTimeout(confirmTimeout)
    }
    
    finalTimeout = setTimeout(() => {
      resetConfirmState()
    }, 3000) // 3秒后重置
    
    return
  }
  
  // 第三次点击 - 执行清空
  resetConfirmState()
  
  try {
    isLoading.value = true
    
    const response = await fetch(`${API_BASE}/delete/articles/clear-all?confirm=true`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      emit('success', data.message, {
        deletedCount: data.deletedCount,
        sourceBreakdown: data.sourceBreakdown
      })
    } else {
      emit('error', data.error || '清空失败')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '清空失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  opacity: 0.8;
}

.clear-all-btn:hover:not(:disabled) {
  opacity: 1;
  transform: translateY(-1px);
}

.clear-all-btn.confirm {
  background: #ffc107;
  color: #212529;
  animation: pulse-warning 1s ease-in-out infinite;
}

.clear-all-btn.final-confirm {
  background: #dc3545;
  color: white;
  animation: pulse-danger 0.8s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.5);
}

.clear-all-btn.loading {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  animation: none;
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.clear-icon {
  font-size: 1rem;
}

.clear-text {
  white-space: nowrap;
}

@keyframes pulse-warning {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
  }
}

@keyframes pulse-danger {
  0%, 100% {
    box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(220, 53, 69, 0.9);
  }
}

@media (max-width: 768px) {
  .clear-all-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>