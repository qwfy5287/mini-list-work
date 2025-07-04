import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { articlesRoutes } from './src/routes/articles'
import { adminRoutes } from './src/routes/admin'
import scheduler from './src/scheduler/job-scheduler'

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Mini-List API',
        version: '1.0.0',
        description: 'Minimalist news aggregation API with AI summaries'
      }
    }
  }))
  .get('/', () => 'Mini-List API Server')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(articlesRoutes)
  .use(adminRoutes)
  .listen(process.env.PORT || 3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

scheduler.start()

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  scheduler.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...')
  scheduler.stop()
  process.exit(0)
})