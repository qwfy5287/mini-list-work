import { Elysia } from 'elysia'
import { db } from '../db/connection'
import { articles } from '../db/schema'

export const quickTestRoutes = new Elysia({ prefix: '/api/test' })
  .post('/add-sample', async () => {
    try {
      const sampleArticle = await db
        .insert(articles)
        .values({
          title: '测试文章 - ' + new Date().toLocaleString(),
          originalUrl: 'https://example.com/test',
          sourceName: '测试源',
          language: 'zh',
          publishedAt: new Date(),
          rawContent: '这是一个测试文章的内容，用于验证系统功能是否正常工作。',
          aiSummary: '这是一个测试文章，用于验证系统功能。',
          category: 'test',
          sentiment: 'neutral',
          readingTime: 1,
          tags: JSON.stringify(['测试', 'demo']),
          isArchived: false
        })
        .returning()

      return {
        success: true,
        message: 'Sample article added',
        article: sampleArticle[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  .get('/count', async () => {
    try {
      const result = await db.select().from(articles)
      return {
        success: true,
        count: result.length,
        articles: result.slice(0, 5) // 返回前5篇文章
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })