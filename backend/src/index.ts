import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import menusRouter from './routes/menus'
import historyRouter from './routes/history'
import categoriesRouter from './routes/categories'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS 설정
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

// 미들웨어
app.use(express.json())

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🎰 Food Roulette API',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      menus: '/api/menus',
      history: '/api/history',
      health: '/api/health',
    },
  })
})

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 라우트
app.use('/api/categories', categoriesRouter)
app.use('/api/menus', menusRouter)
app.use('/api/history', historyRouter)

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🎰 Food Roulette API Server         ║
  ║   Running on http://localhost:${PORT}    ║
  ╚═══════════════════════════════════════╝
  `)
})
