import { Elysia, t } from 'elysia'
import { db } from '../db/connection'
import { articles, dailyDigests } from '../db/schema'
import { desc, eq, and, gte, lte } from 'drizzle-orm'

export const articlesRoutes = new Elysia({ prefix: '/api/articles' })
  .get('/', async ({ query }) => {
    const { 
      page = '1', 
      limit = '20', 
      language, 
      category,
      startDate,
      endDate
    } = query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    let whereCondition: any = undefined

    if (language || category || startDate || endDate) {
      const conditions = []
      
      if (language) conditions.push(eq(articles.language, language))
      if (category) conditions.push(eq(articles.category, category))
      if (startDate) conditions.push(gte(articles.publishedAt, new Date(startDate)))
      if (endDate) conditions.push(lte(articles.publishedAt, new Date(endDate)))
      
      whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0]
    }

    const result = await db
      .select()
      .from(articles)
      .where(whereCondition)
      .orderBy(desc(articles.publishedAt))
      .limit(limitNum)
      .offset(offset)

    const total = await db
      .select({ count: articles.id })
      .from(articles)
      .where(whereCondition)

    return {
      articles: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total.length,
        pages: Math.ceil(total.length / limitNum)
      }
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      language: t.Optional(t.String()),
      category: t.Optional(t.String()),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String())
    })
  })
  
  .get('/:id', async ({ params }) => {
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, parseInt(params.id)))
      .limit(1)

    if (!article.length) {
      return { error: 'Article not found' }
    }

    return { article: article[0] }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  .get('/today', async () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todaysArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          gte(articles.publishedAt, startOfDay),
          lte(articles.publishedAt, endOfDay)
        )
      )
      .orderBy(desc(articles.publishedAt))

    const todaysDigest = await db
      .select()
      .from(dailyDigests)
      .where(
        and(
          gte(dailyDigests.date, startOfDay),
          lte(dailyDigests.date, endOfDay)
        )
      )
      .limit(1)

    return {
      articles: todaysArticles,
      digest: todaysDigest[0] || null,
      summary: {
        total: todaysArticles.length,
        categories: [...new Set(todaysArticles.map(a => a.category))],
        languages: [...new Set(todaysArticles.map(a => a.language))]
      }
    }
  })
  
  .get('/categories', async () => {
    const categories = await db
      .selectDistinct({ category: articles.category })
      .from(articles)
      .where(eq(articles.isArchived, false))

    return {
      categories: categories.map(c => c.category).filter(Boolean)
    }
  })
  
  .get('/trending', async () => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const trending = await db
      .select()
      .from(articles)
      .where(
        and(
          gte(articles.publishedAt, last24Hours),
          eq(articles.isArchived, false)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(10)

    return {
      trending,
      timestamp: new Date().toISOString()
    }
  })