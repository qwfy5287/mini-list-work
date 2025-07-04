import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { articles } from './src/db/schema'

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'mini_list'
})

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    await client.connect()
    
    const db = drizzle(client)
    
    console.log('📊 Testing database query...')
    const result = await db.select().from(articles).limit(1)
    
    console.log('✅ Database connection successful!')
    console.log(`📦 Articles table exists, current count: ${result.length}`)
    
    console.log('🔍 Testing table structure...')
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      ORDER BY ordinal_position;
    `)
    
    console.log('📋 Articles table structure:')
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
    })
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

testConnection()