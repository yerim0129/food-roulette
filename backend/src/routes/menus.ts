import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/menus - 전체 메뉴 조회
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query

    const menus = await prisma.menu.findMany({
      where: categoryId ? { categoryId: Number(categoryId) } : undefined,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(menus)
  } catch (error) {
    console.error('Error fetching menus:', error)
    res.status(500).json({ error: 'Failed to fetch menus' })
  }
})

// GET /api/menus/:id - 단일 메뉴 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const menu = await prisma.menu.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
      },
    })

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    res.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// POST /api/menus - 메뉴 생성
router.post('/', async (req, res) => {
  try {
    const { name, emoji, categoryId, description, imageUrl } = req.body

    if (!name || !emoji || !categoryId) {
      return res.status(400).json({ error: 'name, emoji, categoryId are required' })
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        emoji,
        categoryId: Number(categoryId),
        description,
        imageUrl,
      },
      include: {
        category: true,
      },
    })

    res.status(201).json(menu)
  } catch (error) {
    console.error('Error creating menu:', error)
    res.status(500).json({ error: 'Failed to create menu' })
  }
})

// PUT /api/menus/:id - 메뉴 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, emoji, categoryId, description, imageUrl } = req.body

    const menu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(emoji && { emoji }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        category: true,
      },
    })

    res.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    res.status(500).json({ error: 'Failed to update menu' })
  }
})

// DELETE /api/menus/:id - 메뉴 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.menu.delete({
      where: { id: Number(id) },
    })

    res.json({ message: 'Menu deleted successfully' })
  } catch (error) {
    console.error('Error deleting menu:', error)
    res.status(500).json({ error: 'Failed to delete menu' })
  }
})

export default router
