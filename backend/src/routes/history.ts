import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/history - 히스토리 조회
router.get('/', async (req, res) => {
  try {
    const { limit = 50 } = req.query

    const history = await prisma.history.findMany({
      include: {
        menu: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
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

    if (!menuId) {
      return res.status(400).json({ error: 'menuId is required' })
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
