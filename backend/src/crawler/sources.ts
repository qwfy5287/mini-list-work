export interface NewsSource {
  name: string
  url: string
  language: 'zh' | 'en'
  category: string
  type: 'rss' | 'web'
}

export const newsSources: NewsSource[] = [
  // English sources
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    language: 'en',
    category: 'general',
    type: 'rss'
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com/rssFeed/topNews',
    language: 'en',
    category: 'general',
    type: 'rss'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    language: 'en',
    category: 'tech',
    type: 'rss'
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    language: 'en',
    category: 'world',
    type: 'rss'
  },
  
  // Chinese sources
  {
    name: '新华网',
    url: 'http://www.xinhuanet.com/politics/news_politics.xml',
    language: 'zh',
    category: 'politics',
    type: 'rss'
  },
  {
    name: '澎湃新闻',
    url: 'https://www.thepaper.cn/rss/news.xml',
    language: 'zh',
    category: 'general',
    type: 'rss'
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    language: 'zh',
    category: 'tech',
    type: 'rss'
  },
  {
    name: '财新网',
    url: 'http://www.caixin.com/rss/news.xml',
    language: 'zh',
    category: 'finance',
    type: 'rss'
  }
]