import { Elysia, t } from 'elysia'
import { db } from '../db/connection'
import { articles, dailyDigests } from '../db/schema'
import { crawlAllSources } from '../crawler/rss-parser'
import { batchSummarizeArticles, generateDailySummary } from '../ai/summarizer'
import { newsSources } from '../crawler/sources'
import { extractReadingTime, extractTags, detectSentiment } from '../crawler/content-extractor'
import { eq } from 'drizzle-orm'

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  .post('/crawl', async () => {
    try {
      console.log('Starting news crawl...')
      
      const crawledArticles = await crawlAllSources(newsSources)
      console.log(`Crawled ${crawledArticles.length} articles`)
      
      const summarizedArticles = await batchSummarizeArticles(crawledArticles)
      console.log(`Summarized ${summarizedArticles.length} articles`)
      
      const insertedArticles = []
      
      for (const article of summarizedArticles) {
        try {
          const [inserted] = await db
            .insert(articles)
            .values({
              title: article.title,
              originalUrl: article.originalUrl,
              sourceName: article.sourceName,
              language: article.language,
              publishedAt: article.publishedAt,
              rawContent: article.rawContent,
              aiSummary: article.aiSummary,
              category: article.category,
              sentiment: article.sentiment,
              readingTime: article.readingTime,
              tags: JSON.stringify(article.tags),
              isArchived: false
            })
            .returning()
            
          insertedArticles.push(inserted)
        } catch (error) {
          console.error(`Failed to insert article: ${article.title}`, error)
        }
      }
      
      const dailySummary = await generateDailySummary(summarizedArticles)
      
      await db
        .insert(dailyDigests)
        .values({
          date: new Date(),
          overallSummary: dailySummary,
          topCategories: JSON.stringify([...new Set(summarizedArticles.map(a => a.category))]),
          totalArticles: summarizedArticles.length
        })
        .onConflictDoNothing()
      
      return {
        success: true,
        message: `Successfully processed ${insertedArticles.length} articles`,
        summary: {
          crawled: crawledArticles.length,
          summarized: summarizedArticles.length,
          inserted: insertedArticles.length,
          dailySummary: dailySummary.substring(0, 100) + '...'
        }
      }
    } catch (error) {
      console.error('Crawl error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  .get('/stats', async () => {
    const totalArticles = await db
      .select({ count: articles.id })
      .from(articles)
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    const todayArticles = await db
      .select({ count: articles.id })
      .from(articles)
      .where(gte(articles.publishedAt, startOfDay))
    
    const categories = await db
      .selectDistinct({ category: articles.category })
      .from(articles)
    
    const languages = await db
      .selectDistinct({ language: articles.language })
      .from(articles)
    
    return {
      stats: {
        totalArticles: totalArticles.length,
        todayArticles: todayArticles.length,
        categories: categories.map(c => c.category).filter(Boolean),
        languages: languages.map(l => l.language),
        sources: newsSources.map(s => s.name)
      }
    }
  })
  
  .post('/test-ai', async ({ body }) => {
    const { content } = body
    
    try {
      const testArticle = {
        title: 'Test Article',
        originalUrl: 'https://example.com',
        sourceName: 'Test Source',
        language: 'en' as const,
        publishedAt: new Date(),
        rawContent: content,
        category: 'test'
      }
      
      const summarized = await batchSummarizeArticles([testArticle])
      
      return {
        success: true,
        result: summarized[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    body: t.Object({
      content: t.String()
    })
  })