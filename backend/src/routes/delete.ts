import { Elysia, t } from 'elysia'
import { db } from '../db/connection'
import { articles } from '../db/schema'
import { eq, inArray, lt } from 'drizzle-orm'

export const deleteRoutes = new Elysia({ prefix: '/api/delete' })
  .delete('/article/:id', async ({ params }) => {
    try {
      const articleId = parseInt(params.id)
      
      if (isNaN(articleId)) {
        return {
          success: false,
          error: 'Invalid article ID'
        }
      }

      // 检查文章是否存在
      const existingArticle = await db
        .select()
        .from(articles)
        .where(eq(articles.id, articleId))
        .limit(1)

      if (existingArticle.length === 0) {
        return {
          success: false,
          error: 'Article not found'
        }
      }

      // 删除文章
      await db
        .delete(articles)
        .where(eq(articles.id, articleId))

      return {
        success: true,
        message: `Article ${articleId} deleted successfully`,
        deletedArticle: existingArticle[0]
      }
    } catch (error) {
      console.error('Delete article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  .delete('/articles/batch', async ({ body }) => {
    try {
      const { ids } = body
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          error: 'Invalid or empty IDs array'
        }
      }

      const articleIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id))
      
      if (articleIds.length === 0) {
        return {
          success: false,
          error: 'No valid article IDs provided'
        }
      }

      // 获取要删除的文章信息
      const articlesToDelete = await db
        .select()
        .from(articles)
        .where(inArray(articles.id, articleIds))

      if (articlesToDelete.length === 0) {
        return {
          success: false,
          error: 'No articles found with provided IDs'
        }
      }

      // 批量删除文章
      await db
        .delete(articles)
        .where(inArray(articles.id, articleIds))

      return {
        success: true,
        message: `Successfully deleted ${articlesToDelete.length} articles`,
        deletedCount: articlesToDelete.length,
        deletedArticles: articlesToDelete.map(a => ({ id: a.id, title: a.title }))
      }
    } catch (error) {
      console.error('Batch delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    body: t.Object({
      ids: t.Array(t.Union([t.String(), t.Number()]))
    })
  })
  
  .delete('/articles/by-source/:sourceName', async ({ params }) => {
    try {
      const { sourceName } = params
      
      // 获取要删除的文章
      const articlesToDelete = await db
        .select()
        .from(articles)
        .where(eq(articles.sourceName, sourceName))

      if (articlesToDelete.length === 0) {
        return {
          success: false,
          error: `No articles found from source: ${sourceName}`
        }
      }

      // 删除指定来源的所有文章
      await db
        .delete(articles)
        .where(eq(articles.sourceName, sourceName))

      return {
        success: true,
        message: `Successfully deleted ${articlesToDelete.length} articles from ${sourceName}`,
        deletedCount: articlesToDelete.length,
        sourceName
      }
    } catch (error) {
      console.error('Delete by source error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    params: t.Object({
      sourceName: t.String()
    })
  })
  
  .delete('/articles/old', async ({ query }) => {
    try {
      const { days = '7' } = query
      const daysOld = parseInt(days)
      
      if (isNaN(daysOld) || daysOld < 1) {
        return {
          success: false,
          error: 'Invalid days parameter'
        }
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      // 获取要删除的旧文章
      const oldArticles = await db
        .select()
        .from(articles)
        .where(lt(articles.publishedAt, cutoffDate))

      if (oldArticles.length === 0) {
        return {
          success: false,
          error: `No articles older than ${daysOld} days found`
        }
      }

      // 删除旧文章
      await db
        .delete(articles)
        .where(lt(articles.publishedAt, cutoffDate))

      return {
        success: true,
        message: `Successfully deleted ${oldArticles.length} articles older than ${daysOld} days`,
        deletedCount: oldArticles.length,
        cutoffDate: cutoffDate.toISOString()
      }
    } catch (error) {
      console.error('Delete old articles error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    query: t.Object({
      days: t.Optional(t.String())
    })
  })
  
  .delete('/articles/clear-all', async ({ query }) => {
    try {
      const { confirm } = query
      
      if (confirm !== 'true') {
        return {
          success: false,
          error: 'Missing confirmation. Add ?confirm=true to proceed with clearing all articles.',
          warning: 'This action will delete ALL articles permanently!'
        }
      }

      // 获取要删除的文章统计
      const allArticles = await db
        .select({ 
          id: articles.id, 
          title: articles.title,
          sourceName: articles.sourceName 
        })
        .from(articles)

      if (allArticles.length === 0) {
        return {
          success: false,
          error: 'No articles to delete'
        }
      }

      // 获取统计信息
      const sourceStats = allArticles.reduce((acc, article) => {
        acc[article.sourceName] = (acc[article.sourceName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // 清空所有文章
      await db.delete(articles)

      console.log(`🗑️ CLEAR ALL: Deleted ${allArticles.length} articles`)
      
      return {
        success: true,
        message: `Successfully cleared all articles from database`,
        deletedCount: allArticles.length,
        sourceBreakdown: sourceStats,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Clear all articles error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, {
    query: t.Object({
      confirm: t.Optional(t.String())
    })
  })