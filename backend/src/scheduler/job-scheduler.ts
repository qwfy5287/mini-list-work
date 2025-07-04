import * as schedule from 'node-schedule'
import { db } from '../db/connection'
import { articles, dailyDigests } from '../db/schema'
import { crawlAllSources } from '../crawler/rss-parser'
import { batchSummarizeArticles, generateDailySummary } from '../ai/summarizer'
import { newsSources } from '../crawler/sources'

export class NewsScheduler {
  private jobs: Map<string, schedule.Job> = new Map()

  start() {
    console.log('🕐 Starting news scheduler...')
    
    this.scheduleDaily()
    this.scheduleHourly()
    
    console.log('✅ News scheduler started')
  }

  stop() {
    console.log('🛑 Stopping news scheduler...')
    
    this.jobs.forEach((job, name) => {
      job.cancel()
      console.log(`  ✅ Stopped job: ${name}`)
    })
    
    this.jobs.clear()
    console.log('✅ News scheduler stopped')
  }

  private scheduleDaily() {
    const dailyJob = schedule.scheduleJob('daily-news-crawl', '0 6 * * *', async () => {
      console.log('🌅 Starting daily news crawl...')
      await this.performFullCrawl()
    })

    if (dailyJob) {
      this.jobs.set('daily', dailyJob)
      console.log('📅 Daily crawl scheduled for 6:00 AM')
    }
  }

  private scheduleHourly() {
    const hourlyJob = schedule.scheduleJob('hourly-news-update', '0 */3 * * *', async () => {
      console.log('🔄 Starting hourly news update...')
      await this.performQuickUpdate()
    })

    if (hourlyJob) {
      this.jobs.set('hourly', hourlyJob)
      console.log('⏰ Hourly updates scheduled every 3 hours')
    }
  }

  async performFullCrawl() {
    try {
      console.log('📡 Crawling all news sources...')
      const crawledArticles = await crawlAllSources(newsSources)
      console.log(`📰 Crawled ${crawledArticles.length} articles`)

      if (crawledArticles.length === 0) {
        console.log('⚠️ No articles crawled, skipping summarization')
        return
      }

      console.log('🤖 Summarizing articles with AI...')
      const summarizedArticles = await batchSummarizeArticles(crawledArticles)
      console.log(`✨ Summarized ${summarizedArticles.length} articles`)

      console.log('💾 Saving articles to database...')
      const savedCount = await this.saveArticles(summarizedArticles)
      console.log(`💾 Saved ${savedCount} articles`)

      console.log('📊 Generating daily summary...')
      const dailySummary = await generateDailySummary(summarizedArticles)
      await this.saveDailyDigest(summarizedArticles, dailySummary)
      console.log('📊 Daily summary generated and saved')

      console.log(`✅ Daily crawl completed: ${savedCount} articles processed`)
    } catch (error) {
      console.error('❌ Daily crawl failed:', error)
    }
  }

  async performQuickUpdate() {
    try {
      console.log('⚡ Quick update: crawling recent articles...')
      
      const recentSources = newsSources.slice(0, 4)
      const crawledArticles = await crawlAllSources(recentSources)
      
      if (crawledArticles.length === 0) {
        console.log('⚠️ No new articles found')
        return
      }

      const recentArticles = crawledArticles.filter(article => {
        const articleDate = new Date(article.publishedAt)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
        return articleDate > sixHoursAgo
      })

      if (recentArticles.length === 0) {
        console.log('⚠️ No recent articles to process')
        return
      }

      console.log(`🤖 Summarizing ${recentArticles.length} recent articles...`)
      const summarizedArticles = await batchSummarizeArticles(recentArticles)
      
      const savedCount = await this.saveArticles(summarizedArticles)
      console.log(`✅ Quick update completed: ${savedCount} articles added`)
    } catch (error) {
      console.error('❌ Quick update failed:', error)
    }
  }

  private async saveArticles(summarizedArticles: any[]): Promise<number> {
    let savedCount = 0

    for (const article of summarizedArticles) {
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

        await db.insert(articles).values({
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

        savedCount++
      } catch (error) {
        console.error(`❌ Failed to save article: ${article.title}`, error)
      }
    }

    return savedCount
  }

  private async saveDailyDigest(summarizedArticles: any[], dailySummary: string) {
    try {
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
    } catch (error) {
      console.error('❌ Failed to save daily digest:', error)
    }
  }

  async runManualCrawl() {
    console.log('🚀 Manual crawl triggered')
    await this.performFullCrawl()
  }
}

const scheduler = new NewsScheduler()
export default scheduler