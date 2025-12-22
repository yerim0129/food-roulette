import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// 유효한 양의 정수인지 확인
const isValidPositiveInt = (value: unknown): boolean => {
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) && num > 0
}

// GET /api/menus - 전체 메뉴 조회
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query

    // categoryId 유효성 검증
    if (categoryId !== undefined && !isValidPositiveInt(categoryId)) {
      return res.status(400).json({ error: 'categoryId must be a positive integer' })
    }

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

    // id 유효성 검증
    if (!isValidPositiveInt(id)) {
      return res.status(400).json({ error: 'id must be a positive integer' })
    }

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

    // 필수 필드 검증
    if (!name || !emoji || !categoryId) {
      return res.status(400).json({ error: 'name, emoji, categoryId are required' })
    }

    // categoryId 유효성 검증
    if (!isValidPositiveInt(categoryId)) {
      return res.status(400).json({ error: 'categoryId must be a positive integer' })
    }

    // 문자열 타입 검증
    if (typeof name !== 'string' || typeof emoji !== 'string') {
      return res.status(400).json({ error: 'name and emoji must be strings' })
    }

    const menu = await prisma.menu.create({
      data: {
        name: name.trim(),
        emoji: emoji.trim(),
        categoryId: Number(categoryId),
        description: description?.trim(),
        imageUrl: imageUrl?.trim(),
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

    // id 유효성 검증
    if (!isValidPositiveInt(id)) {
      return res.status(400).json({ error: 'id must be a positive integer' })
    }

    // categoryId 유효성 검증 (제공된 경우)
    if (categoryId !== undefined && !isValidPositiveInt(categoryId)) {
      return res.status(400).json({ error: 'categoryId must be a positive integer' })
    }

    const menu = await prisma.menu.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(emoji && { emoji: String(emoji).trim() }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() }),
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

    // id 유효성 검증
    if (!isValidPositiveInt(id)) {
      return res.status(400).json({ error: 'id must be a positive integer' })
    }

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
