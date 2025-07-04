import * as cheerio from 'cheerio'

export function extractReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function extractTags(content: string): string[] {
  const $ = cheerio.load(content)
  const text = $.text()
  
  const commonTags = [
    'breaking', 'update', 'exclusive', 'analysis', 'report',
    'technology', 'politics', 'business', 'health', 'science',
    '科技', '政治', '商业', '健康', '科学', '突发', '更新', '独家', '分析', '报道'
  ]
  
  const foundTags = commonTags.filter(tag => 
    text.toLowerCase().includes(tag.toLowerCase())
  )
  
  return foundTags.slice(0, 5)
}

export function detectSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'success', 'achievement', '好', '优秀', '成功', '成就']
  const negativeWords = ['bad', 'terrible', 'crisis', 'failure', 'problem', '坏', '糟糕', '危机', '失败', '问题']
  
  const text = content.toLowerCase()
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

export function cleanContent(content: string): string {
  const $ = cheerio.load(content)
  
  $('script').remove()
  $('style').remove()
  $('nav').remove()
  $('footer').remove()
  $('header').remove()
  $('.ad, .advertisement, .ads').remove()
  
  return $.text().trim()
}