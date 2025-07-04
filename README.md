# Mini-List

极简新闻聚合应用，使用 AI 自动总结国内外热点新闻。

## 🎯 特性

- **极简设计**: 专注于内容，减少干扰
- **AI 摘要**: 使用 OpenAI 自动生成新闻摘要
- **双语支持**: 支持中英文新闻源
- **自动更新**: 定时抓取和更新新闻内容
- **移动友好**: 响应式设计，适配各种设备

## 🛠️ 技术栈

### 前端
- **Vue 3** + TypeScript
- **Vite** 构建工具
- **Pinia** 状态管理

### 后端
- **ElysiaJS** + TypeScript
- **Drizzle ORM** + PostgreSQL
- **OpenAI API** 用于 AI 摘要
- **Node-schedule** 定时任务

### 包管理器
- **Bun** 快速包管理和运行时

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Bun
- PostgreSQL
- OpenAI API Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd mini-list-work
```

### 2. 安装依赖

```bash
bun install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 配置数据库和 API 密钥：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mini_list

OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

### 4. 数据库设置

创建数据库：

```bash
createdb mini_list
```

运行数据库迁移：

```bash
cd backend
bun run drizzle-kit generate
bun run drizzle-kit migrate
```

### 5. 启动开发环境

```bash
# 同时启动前后端
bun run dev

# 或分别启动
bun run dev:backend  # 后端
bun run dev:frontend # 前端
```

访问：
- 前端: http://localhost:5173
- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/swagger

## 📁 项目结构

```
mini-list-work/
├── frontend/mini-list-frontend/  # Vue 3 前端应用
│   ├── src/
│   │   ├── components/          # 组件
│   │   ├── views/              # 页面
│   │   └── ...
├── backend/                     # ElysiaJS 后端应用
│   ├── src/
│   │   ├── routes/             # API 路由
│   │   ├── db/                 # 数据库相关
│   │   ├── crawler/            # 新闻爬虫
│   │   ├── ai/                 # AI 摘要
│   │   └── scheduler/          # 定时任务
│   └── ...
├── shared/                      # 共享类型和工具
└── package.json                # 根目录配置
```

## 🔧 开发指南

### API 端点

#### 文章相关
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/today` - 获取今日文章
- `GET /api/articles/trending` - 获取热门文章
- `GET /api/articles/:id` - 获取单篇文章

#### 管理相关
- `POST /api/admin/crawl` - 手动触发爬虫
- `GET /api/admin/stats` - 获取统计信息
- `POST /api/admin/test-ai` - 测试 AI 摘要

### 定时任务

- **每日爬虫**: 每天 6:00 AM 全量抓取新闻
- **增量更新**: 每 3 小时更新最新文章

### 数据库模式

主要表结构：
- `articles` - 新闻文章
- `daily_digests` - 每日摘要
- `user_preferences` - 用户偏好设置

## 🔒 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `DB_HOST` | 数据库主机 | ✅ |
| `DB_PORT` | 数据库端口 | ✅ |
| `DB_USER` | 数据库用户 | ✅ |
| `DB_PASSWORD` | 数据库密码 | ✅ |
| `DB_NAME` | 数据库名称 | ✅ |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ✅ |
| `PORT` | 服务器端口 | ❌ |

## 📝 TODO

- [ ] 用户认证系统
- [ ] 个性化推荐
- [ ] 离线阅读功能
- [ ] 推送通知
- [ ] 深色模式
- [ ] 文章搜索功能
- [ ] 分类筛选
- [ ] 社交分享功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License