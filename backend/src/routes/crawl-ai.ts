import { Elysia } from 'elysia'
import { db } from '../db/connection'
import { articles, dailyDigests } from '../db/schema'
import { crawlAllSources } from '../crawler/rss-parser'
import { batchSummarizeArticles, generateDailySummary } from '../ai/summarizer'
import { newsSources } from '../crawler/sources'
import { eq } from 'drizzle-orm'

export const aiCrawlRoutes = new Elysia({ prefix: '/api/ai' })
  .post('/crawl', async ({ headers }) => {
    try {
      console.log('🚀 Starting AI-powered crawl...')
      
      // 检查是否是流式请求
      const isStream = headers['accept'] === 'text/event-stream'
      
      if (isStream) {
        // 流式响应 - 实时进度更新
        return new Response(
          new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder()
              
              const sendEvent = (event: string, data: any) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
                controller.enqueue(encoder.encode(message))
              }
              
              try {
                sendEvent('progress', { step: 'crawling', message: '开始抓取新闻源...' })
                
                const crawledArticles = await crawlAllSources(newsSources)
                sendEvent('progress', { 
                  step: 'crawled', 
                  message: `抓取完成，共 ${crawledArticles.length} 篇文章`,
                  count: crawledArticles.length 
                })
                
                if (crawledArticles.length === 0) {
                  sendEvent('error', { message: '没有抓取到任何文章' })
                  controller.close()
                  return
                }
                
                sendEvent('progress', { step: 'ai_processing', message: '开始AI摘要处理...' })
                
                const summarizedArticles = await batchSummarizeArticles(crawledArticles)
                sendEvent('progress', { 
                  step: 'ai_completed', 
                  message: `AI处理完成，共 ${summarizedArticles.length} 篇文章`,
                  count: summarizedArticles.length 
                })
                
                sendEvent('progress', { step: 'saving', message: '保存到数据库...' })
                
                const insertedArticles = []
                for (const article of summarizedArticles) {
                  try {
                    const existingArticle = await db
                      .select()
                      .from(articles)
                      .where(eq(articles.originalUrl, article.originalUrl))
                      .limit(1)

                    if (existingArticle.length > 0) {
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
                
                sendEvent('progress', { step: 'digest', message: '生成每日摘要...' })
                
                const dailySummary = await generateDailySummary(summarizedArticles)
                
                const today = new Date()
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                
                await db
                  .insert(dailyDigests)
                  .values({
                    date: startOfDay,
                    overallSummary: dailySummary,
                    topCategories: JSON.stringify([...new Set(summarizedArticles.map(a => a.category))]),
                    totalArticles: summarizedArticles.length
                  })
                  .onConflictDoNothing()
                
                sendEvent('complete', {
                  success: true,
                  message: `处理完成！保存了 ${insertedArticles.length} 篇文章`,
                  summary: {
                    crawled: crawledArticles.length,
                    processed: summarizedArticles.length,
                    saved: insertedArticles.length,
                    dailySummary: dailySummary.substring(0, 100) + '...'
                  }
                })
                
                controller.close()
              } catch (error) {
                sendEvent('error', { 
                  message: error instanceof Error ? error.message : '未知错误' 
                })
                controller.close()
              }
            }
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          }
        )
      } else {
        // 普通JSON响应 - 简化版
        const crawledArticles = await crawlAllSources(newsSources)
        console.log(`📰 Crawled ${crawledArticles.length} articles`)
        
        if (crawledArticles.length === 0) {
          return {
            success: false,
            message: 'No articles crawled'
          }
        }
        
        // 只处理前5篇文章避免超时
        const limitedArticles = crawledArticles.slice(0, 5)
        const summarizedArticles = await batchSummarizeArticles(limitedArticles)
        console.log(`✨ Summarized ${summarizedArticles.length} articles`)
        
        // 保存文章
        const insertedArticles = []
        for (const article of summarizedArticles) {
          try {
            const existingArticle = await db
              .select()
              .from(articles)
              .where(eq(articles.originalUrl, article.originalUrl))
              .limit(1)

            if (existingArticle.length > 0) {
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
        
        return {
          success: true,
          message: `Successfully processed ${insertedArticles.length} articles with AI`,
          summary: {
            crawled: crawledArticles.length,
            processed: summarizedArticles.length,
            saved: insertedArticles.length
          }
        }
      }
    } catch (error) {
      console.error('❌ AI crawl failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })