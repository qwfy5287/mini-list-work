<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

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

const API_BASE = 'http://localhost:3000/api'

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

onMounted(() => {
  fetchTodayArticles()
})
</script>

<template>
  <div class="home">
    <section class="daily-digest">
      <h2 class="section-title">📅 今日摘要</h2>
      
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
      
      <div v-else class="articles-list">
        <ArticleCard 
          v-for="article in articles" 
          :key="article.id"
          :article="article"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding: 1rem 0;
}

.daily-digest {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
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

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .home {
    padding: 0.5rem 0;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}
</style>
