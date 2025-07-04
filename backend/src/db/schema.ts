import { pgTable, text, timestamp, boolean, integer, serial, varchar, index } from 'drizzle-orm/pg-core'

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  originalUrl: text('original_url').notNull(),
  sourceName: varchar('source_name', { length: 100 }).notNull(),
  language: varchar('language', { length: 2 }).notNull(),
  publishedAt: timestamp('published_at').notNull(),
  rawContent: text('raw_content'),
  aiSummary: text('ai_summary'),
  category: varchar('category', { length: 50 }),
  sentiment: varchar('sentiment', { length: 20 }),
  readingTime: integer('reading_time'),
  tags: text('tags'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    languageIdx: index('language_idx').on(table.language),
    categoryIdx: index('category_idx').on(table.category),
    publishedAtIdx: index('published_at_idx').on(table.publishedAt),
    createdAtIdx: index('created_at_idx').on(table.createdAt)
  }
})

export const dailyDigests = pgTable('daily_digests', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  overallSummary: text('overall_summary'),
  topCategories: text('top_categories'),
  totalArticles: integer('total_articles').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    dateIdx: index('date_idx').on(table.date)
  }
})

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('both'),
  categories: text('categories'),
  sources: text('sources'),
  summaryLength: varchar('summary_length', { length: 20 }).default('medium'),
  updateFrequency: varchar('update_frequency', { length: 20 }).default('daily'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type DailyDigest = typeof dailyDigests.$inferSelect
export type NewDailyDigest = typeof dailyDigests.$inferInsert
export type UserPreference = typeof userPreferences.$inferSelect
export type NewUserPreference = typeof userPreferences.$inferInsert