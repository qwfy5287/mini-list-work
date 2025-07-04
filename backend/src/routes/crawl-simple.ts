import { Elysia } from 'elysia'
import { db } from '../db/connection'
import { articles, dailyDigests } from '../db/schema'
import { crawlAllSources } from '../crawler/rss-parser'
import { newsSources } from '../crawler/sources'
import { eq } from 'drizzle-orm'

export const simpleCrawlRoutes = new Elysia({ prefix: '/api/simple' })
  .post('/crawl', async () => {
    try {
      console.log('🚀 Starting simple crawl (no AI)...')
      
      const crawledArticles = await crawlAllSources(newsSources)
      console.log(`📰 Crawled ${crawledArticles.length} articles`)
      
      if (crawledArticles.length === 0) {
        return {
          success: false,
          message: 'No articles crawled'
        }
      }
      
      const insertedArticles = []
      
      // 混合处理：确保中英文文章都能被处理
      const shuffledArticles = crawledArticles.sort(() => Math.random() - 0.5)
      for (const article of shuffledArticles.slice(0, 1000)) { // 随机混合后取前100篇
        try {
          const existingArticle = await db
            .select()
            .from(articles)
            .where(eq(articles.originalUrl, article.originalUrl))
            .limit(1)

          if (existingArticle.length > 0) {
            console.log(`⏭️ Skipping duplicate: ${article.title.substring(0, 50)}...`)
            continue
          }

          const [inserted] = await db
            .insert(articles)
            .values({
              title: article.title,
              originalUrl: article.originalUrl,
              sourceName: article.sourceName,
              language: article.language,
              publishedAt: article.publishedAt,
              rawContent: article.rawContent,
              aiSummary: article.rawContent.substring(0, 150) + '...', // 简单截取前150字
              category: article.category,
              sentiment: 'neutral',
              readingTime: Math.ceil(article.rawContent.split(/\s+/).length / 200),
              tags: JSON.stringify(['news']),
              isArchived: false
            })
            .returning()
            
          insertedArticles.push(inserted)
          console.log(`✅ Saved: ${article.title.substring(0, 50)}...`)
        } catch (error) {
          console.error(`❌ Failed to insert article: ${article.title}`, error)
        }
      }
      
      // 创建简单的每日摘要
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      const simpleSummary = `今日共抓取 ${insertedArticles.length} 篇新闻文章，涵盖了多个分类。`
      
      await db
        .insert(dailyDigests)
        .values({
          date: startOfDay,
          overallSummary: simpleSummary,
          topCategories: JSON.stringify([...new Set(insertedArticles.map(a => a.category))]),
          totalArticles: insertedArticles.length
        })
        .onConflictDoNothing()
      
      return {
        success: true,
        message: `Successfully processed ${insertedArticles.length} articles (simple mode)`,
        summary: {
          crawled: crawledArticles.length,
          inserted: insertedArticles.length,
          sources: newsSources.map(s => s.name)
        }
      }
    } catch (error) {
      console.error('❌ Simple crawl failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })