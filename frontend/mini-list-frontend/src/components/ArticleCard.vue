<template>
  <article class="article-card">
    <div class="article-meta">
      <span class="language-tag" :class="props.article.language">
        {{ props.article.language === 'zh' ? '中文' : 'EN' }}
      </span>
      <span class="category">{{ props.article.category }}</span>
      <span class="reading-time">{{ props.article.readingTime }}min read</span>
      <span class="published-time">{{ formatTime(props.article.publishedAt) }}</span>
    </div>
    
    <h2 class="article-title">{{ props.article.title }}</h2>
    
    <p class="article-summary">{{ props.article.aiSummary }}</p>
    
    <div class="article-footer">
      <span class="source">{{ props.article.sourceName }}</span>
      <div class="article-actions">
        <DeleteButton 
          v-if="isAdminMode"
          :article-id="props.article.id"
          :article-title="props.article.title"
          @deleted="handleDeleted"
          @error="handleDeleteError"
        />
        <a :href="props.article.originalUrl" target="_blank" rel="noopener" class="read-more">
          阅读原文 →
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import DeleteButton from './DeleteButton.vue'
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

interface Props {
  article: Article
}

interface Emits {
  (e: 'deleted', articleId: number): void
  (e: 'error', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { isAdminMode, addAdminLog } = useAdmin()

function handleDeleted(articleId: number) {
  addAdminLog(`删除文章: ${props.article.title}`)
  emit('deleted', articleId)
}

function handleDeleteError(message: string) {
  addAdminLog(`删除失败: ${message}`)
  emit('error', message)
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) {
    return '刚刚'
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.article-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.language-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
}

.language-tag.zh {
  background: #e3f2fd;
  color: #1976d2;
}

.language-tag.en {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.reading-time,
.published-time {
  color: #999;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.article-summary {
  color: #555;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.source {
  color: #666;
  font-weight: 500;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.read-more {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.read-more:hover {
  color: #0056b3;
}

@media (max-width: 768px) {
  .article-card {
    padding: 1rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .article-title {
    font-size: 1.1rem;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .article-actions {
    gap: 0.5rem;
  }
}
</style>