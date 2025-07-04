<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import LanguageFilter from '../components/LanguageFilter.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import RefreshButton from '../components/RefreshButton.vue'
import CrawlButton from '../components/CrawlButton.vue'
import ClearAllButton from '../components/ClearAllButton.vue'
import Toast from '../components/Toast.vue'
import { useAdmin } from '../composables/useAdmin'

interface Article {
  id: number
  title: string
  originalUrl: string
  sourceName: string
  language: string
  publishedAt: string
  aiSummary: string
  category: string
  readingTime: number
}

const articles = ref<Article[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const languageFilter = ref<'all' | 'zh' | 'en'>('all')
const categoryFilter = ref<string>('all')
const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info'
})

const API_BASE = import.meta.env.VITE_API_BASE_URL+'/api'

const { isAdminMode, addAdminLog } = useAdmin()

// 计算筛选后的文章
const filteredArticles = computed(() => {
  let filtered = articles.value

  // 语言筛选
  if (languageFilter.value !== 'all') {
    filtered = filtered.filter(article => article.language === languageFilter.value)
  }

  // 分类筛选
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(article => article.category === categoryFilter.value)
  }

  return filtered
})

// 获取所有可用的分类
const availableCategories = computed(() => {
  const categories = ['all', ...new Set(articles.value.map(article => article.category))]
  return categories
})

async function fetchTodayArticles() {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE}/articles/today`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    articles.value = data.articles || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    console.error('Failed to fetch articles:', err)
  } finally {
    loading.value = false
  }
}

function handleLanguageChange(language: 'all' | 'zh' | 'en') {
  languageFilter.value = language
}

function handleCategoryChange(category: string) {
  categoryFilter.value = category
}

function showToast(message: string, type: 'success' | 'error' | 'info') {
  toast.value = { show: true, message, type }
}

function hideToast() {
  toast.value.show = false
}

function handleCrawlSuccess(message: string) {
  showToast(message, 'success')
  // 抓取成功后自动刷新文章列表
  setTimeout(() => {
    fetchTodayArticles()
  }, 1000)
}

function handleCrawlError(message: string) {
  showToast(message, 'error')
}

function handleArticleDeleted(articleId: number) {
  // 从文章列表中移除被删除的文章
  articles.value = articles.value.filter(article => article.id !== articleId)
  showToast('文章删除成功', 'success')
}

function handleDeleteError(message: string) {
  showToast(`删除失败: ${message}`, 'error')
}

function handleClearAllSuccess(message: string, stats: any) {
  showToast(message, 'success')
  addAdminLog(`清空所有文章: ${stats.deletedCount} 篇`, 'clear-all')
  // 清空后重新加载文章列表
  articles.value = []
  fetchTodayArticles()
}

function handleClearAllError(message: string) {
  showToast(`清空失败: ${message}`, 'error')
}

onMounted(() => {
  fetchTodayArticles()
})
</script>

<template>
  <div class="home">
    <section class="daily-digest">
      <div class="section-header">
        <div class="title-area">
          <h2 class="section-title">📅 今日摘要</h2>
          <div v-if="isAdminMode" class="admin-badge">
            🔧 管理员模式
          </div>
        </div>
        <div class="header-actions">
          <CrawlButton 
            @success="handleCrawlSuccess"
            @error="handleCrawlError"
          />
          <RefreshButton 
            :is-loading="loading" 
            @refresh="fetchTodayArticles" 
          />
          <ClearAllButton 
            v-if="isAdminMode"
            @success="handleClearAllSuccess"
            @error="handleClearAllError"
          />
        </div>
      </div>
      
      <LoadingSpinner v-if="loading" text="正在加载今日新闻..." />
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchTodayArticles()" class="retry-button">
          重试
        </button>
      </div>
      
      <div v-else-if="articles.length === 0" class="empty-state">
        <p>今日暂无新闻</p>
      </div>
      
      <template v-else>
        <!-- 筛选器 -->
        <div class="filters">
          <LanguageFilter 
            :current-filter="languageFilter" 
            @change="handleLanguageChange" 
          />
          <CategoryFilter 
            :categories="availableCategories" 
            :current-category="categoryFilter"
            @change="handleCategoryChange" 
          />
        </div>
        
        <!-- 文章统计 -->
        <div class="articles-stats">
          <span class="stats-text">
            共 {{ filteredArticles.length }} 篇文章
            <template v-if="languageFilter !== 'all'">
              · {{ languageFilter === 'zh' ? '中文' : 'English' }}
            </template>
            <template v-if="categoryFilter !== 'all'">
              · {{ categoryFilter }}
            </template>
          </span>
        </div>
        
        <!-- 文章列表 -->
        <div v-if="filteredArticles.length === 0" class="no-results">
          <p>没有符合筛选条件的文章</p>
          <button @click="languageFilter = 'all'; categoryFilter = 'all'" class="reset-filter-btn">
            重置筛选
          </button>
        </div>
        
        <div v-else class="articles-list">
          <ArticleCard 
            v-for="article in filteredArticles" 
            :key="article.id"
            :article="article"
            @deleted="handleArticleDeleted"
            @error="handleDeleteError"
          />
        </div>
      </template>
    </section>
    
    <!-- Toast 通知 -->
    <Toast 
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="hideToast"
    />
  </div>
</template>

<style scoped>
.home {
  padding: 1rem 0;
}

.daily-digest {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.admin-badge {
  background: #ff6b35;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
  animation: pulse-admin 2s ease-in-out infinite;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message p {
  color: #d32f2f;
  margin-bottom: 1rem;
}

.retry-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background: #0056b3;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters {
  margin-bottom: 1rem;
}

.articles-stats {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.stats-text {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-results p {
  color: #666;
  margin-bottom: 1rem;
}

.reset-filter-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.reset-filter-btn:hover {
  background: #545b62;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .home {
    padding: 0.5rem 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .articles-stats {
    margin-bottom: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .stats-text {
    font-size: 0.8rem;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .admin-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
}

@keyframes pulse-admin {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>
