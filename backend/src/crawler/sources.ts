export interface NewsSource {
  name: string
  url: string
  language: 'zh' | 'en'
  category: string
  type: 'rss' | 'web'
}

export const newsSources: NewsSource[] = [
  // English sources (reliable feeds)
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
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
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    language: 'en',
    category: 'tech',
    type: 'rss'
  },
  
  // Chinese sources (verified working feeds)
  // {
  //   name: '新华网',
  //   url: 'http://www.xinhuanet.com/politics/news_politics.xml',
  //   language: 'zh',
  //   category: 'politics',
  //   type: 'rss'
  // },
  {
    name: '新华每日电讯',
    url: 'https://feedx.net/rss/mrdx.xml',
    language: 'zh',
    category: 'politics',
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
    name: '知乎日报',
    url: 'https://feeds.feedburner.com/zhihu-daily',
    language: 'zh',
    category: 'general',
    type: 'rss'
  }
]