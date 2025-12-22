import { Router } from 'express'
import prisma from '../lib/prisma'
import { isValidPositiveInt, MAX_HISTORY_LIMIT } from '../utils/validation'

const router = Router()

// GET /api/history - 히스토리 조회
router.get('/', async (req, res) => {
  try {
    const { limit = 50 } = req.query

    // limit 유효성 검증
    if (limit !== undefined && !isValidPositiveInt(limit)) {
      return res.status(400).json({ error: 'limit must be a positive integer' })
    }

    const history = await prisma.history.findMany({
      include: {
        menu: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), MAX_HISTORY_LIMIT),
    })

    res.json(history)
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// POST /api/history - 히스토리 추가
router.post('/', async (req, res) => {
  try {
    const { menuId } = req.body

    // 필수 필드 검증
    if (!menuId) {
      return res.status(400).json({ error: 'menuId is required' })
    }

    // menuId 유효성 검증
    if (!isValidPositiveInt(menuId)) {
      return res.status(400).json({ error: 'menuId must be a positive integer' })
    }

    // 메뉴 존재 확인
    const menu = await prisma.menu.findUnique({
      where: { id: Number(menuId) },
    })

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const history = await prisma.history.create({
      data: {
        menuId: Number(menuId),
      },
      include: {
        menu: {
          include: {
            category: true,
          },
        },
      },
    })

    res.status(201).json(history)
  } catch (error) {
    console.error('Error creating history:', error)
    res.status(500).json({ error: 'Failed to create history' })
  }
})

// DELETE /api/history/:id - 히스토리 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // id 유효성 검증
    if (!isValidPositiveInt(id)) {
      return res.status(400).json({ error: 'id must be a positive integer' })
    }

    await prisma.history.delete({
      where: { id: Number(id) },
    })

    res.json({ message: 'History deleted successfully' })
  } catch (error) {
    console.error('Error deleting history:', error)
    res.status(500).json({ error: 'Failed to delete history' })
  }
})

// DELETE /api/history - 전체 히스토리 삭제
router.delete('/', async (req, res) => {
  try {
    await prisma.history.deleteMany()
    res.json({ message: 'All history deleted successfully' })
  } catch (error) {
    console.error('Error clearing history:', error)
    res.status(500).json({ error: 'Failed to clear history' })
  }
})

export default router
