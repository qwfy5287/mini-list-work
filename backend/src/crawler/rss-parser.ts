import FeedParser from 'feedparser'
import { Readable } from 'stream'
import { NewsSource } from './sources'

export interface ParsedArticle {
  title: string
  originalUrl: string
  sourceName: string
  language: 'zh' | 'en'
  publishedAt: Date
  rawContent: string
  category: string
  description?: string
}

export async function parseRSSFeed(source: NewsSource): Promise<ParsedArticle[]> {
  return new Promise((resolve, reject) => {
    const articles: ParsedArticle[] = []
    const feedparser = new FeedParser({})

    fetch(source.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.body
      })
      .then(stream => {
        if (!stream) {
          throw new Error('No response body')
        }

        const readable = Readable.fromWeb(stream)
        
        readable.on('error', reject)
        
        feedparser.on('error', reject)
        
        feedparser.on('readable', function() {
          let item
          while (item = feedparser.read()) {
            articles.push({
              title: item.title || '',
              originalUrl: item.link || '',
              sourceName: source.name,
              language: source.language,
              publishedAt: item.date || new Date(),
              rawContent: item.description || item.summary || '',
              category: source.category,
              description: item.description || item.summary
            })
          }
        })
        
        feedparser.on('end', () => {
          resolve(articles)
        })
        
        readable.pipe(feedparser)
      })
      .catch(reject)
  })
}

export async function crawlAllSources(sources: NewsSource[]): Promise<ParsedArticle[]> {
  const allArticles: ParsedArticle[] = []
  
  for (const source of sources) {
    try {
      console.log(`Crawling ${source.name}...`)
      const articles = await parseRSSFeed(source)
      allArticles.push(...articles)
      console.log(`✓ ${source.name}: ${articles.length} articles`)
    } catch (error) {
      console.error(`✗ Failed to crawl ${source.name}:`, error)
    }
  }
  
  return allArticles
}