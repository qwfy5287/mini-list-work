import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export function useAdmin() {
  const route = useRoute()
  
  // 检查URL参数中是否包含 role=admin
  const isAdminMode = computed(() => {
    return route.query.role === 'admin'
  })
  
  // 管理员操作日志
  const adminLogs = ref<string[]>([])
  
  function addAdminLog(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    adminLogs.value.unshift(`[${timestamp}] ${message}`)
    
    // 只保留最近50条日志
    if (adminLogs.value.length > 50) {
      adminLogs.value = adminLogs.value.slice(0, 50)
    }
  }
  
  function clearAdminLogs() {
    adminLogs.value = []
  }
  
  return {
    isAdminMode,
    adminLogs,
    addAdminLog,
    clearAdminLogs
  }
}