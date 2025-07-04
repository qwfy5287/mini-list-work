import OpenAI from 'openai'
import { ParsedArticle } from '../crawler/rss-parser'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface SummarizedArticle extends ParsedArticle {
  aiSummary: string
  readingTime: number
  tags: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
}

export async function summarizeArticle(article: ParsedArticle): Promise<string> {
  const prompt = `请为以下新闻文章生成一个简洁的摘要，不超过100字：

标题：${article.title}
内容：${article.rawContent}

要求：
1. 提取核心信息
2. 保持客观中性
3. 突出关键事实
4. 使用${article.language === 'zh' ? '中文' : '英文'}回复`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个专业的新闻摘要助手，能够快速提取文章核心信息。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    })

    return completion.choices[0]?.message?.content || '无法生成摘要'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return '摘要生成失败'
  }
}

export async function generateDailySummary(articles: SummarizedArticle[]): Promise<string> {
  const categorizedArticles = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as Record<string, SummarizedArticle[]>)

  const categoryStats = Object.entries(categorizedArticles)
    .map(([category, arts]) => `${category}: ${arts.length}篇`)
    .join(', ')

  const topArticles = articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5)
    .map(article => `• ${article.title}`)
    .join('\n')

  const prompt = `基于今日新闻数据，生成每日摘要：

统计数据：
- 总文章数：${articles.length}篇
- 分类统计：${categoryStats}

热点文章：
${topArticles}

请生成一个简洁的每日新闻摘要，不超过200字，包含：
1. 今日新闻整体概况
2. 主要热点话题
3. 重要事件总结`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个专业的新闻分析师，能够总结每日新闻要点。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.4
    })

    return completion.choices[0]?.message?.content || '无法生成每日摘要'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return '每日摘要生成失败'
  }
}

export async function batchSummarizeArticles(articles: ParsedArticle[]): Promise<SummarizedArticle[]> {
  const summarizedArticles: SummarizedArticle[] = []
  
  for (const article of articles) {
    try {
      const aiSummary = await summarizeArticle(article)
      
      summarizedArticles.push({
        ...article,
        aiSummary,
        readingTime: Math.ceil(article.rawContent.split(/\s+/).length / 200),
        tags: extractTags(article.rawContent),
        sentiment: detectSentiment(article.rawContent)
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Failed to summarize article: ${article.title}`, error)
    }
  }
  
  return summarizedArticles
}

function extractTags(content: string): string[] {
  const commonTags = [
    'breaking', 'update', 'exclusive', 'analysis', 'report',
    'technology', 'politics', 'business', 'health', 'science',
    '科技', '政治', '商业', '健康', '科学', '突发', '更新', '独家', '分析', '报道'
  ]
  
  const foundTags = commonTags.filter(tag => 
    content.toLowerCase().includes(tag.toLowerCase())
  )
  
  return foundTags.slice(0, 5)
}

function detectSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'success', 'achievement', '好', '优秀', '成功', '成就']
  const negativeWords = ['bad', 'terrible', 'crisis', 'failure', 'problem', '坏', '糟糕', '危机', '失败', '问题']
  
  const text = content.toLowerCase()
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}