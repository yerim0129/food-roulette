import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { id: 1, name: '한식', emoji: '🍚' },
  { id: 2, name: '중식', emoji: '🥟' },
  { id: 3, name: '양식', emoji: '🍝' },
  { id: 4, name: '일식', emoji: '🍣' },
  { id: 5, name: '분식', emoji: '🍢' },
]

const menus = [
  // 한식
  { name: '김치찌개', emoji: '🍲', categoryId: 1 },
  { name: '비빔밥', emoji: '🍚', categoryId: 1 },
  { name: '불고기', emoji: '🥩', categoryId: 1 },
  { name: '삼겹살', emoji: '🥓', categoryId: 1 },
  { name: '된장찌개', emoji: '🥘', categoryId: 1 },
  { name: '제육볶음', emoji: '🍖', categoryId: 1 },
  { name: '갈비탕', emoji: '🍲', categoryId: 1 },
  { name: '냉면', emoji: '🍜', categoryId: 1 },
  { name: '순두부찌개', emoji: '🥘', categoryId: 1 },
  { name: '닭갈비', emoji: '🍗', categoryId: 1 },

  // 중식
  { name: '짜장면', emoji: '🍝', categoryId: 2 },
  { name: '짬뽕', emoji: '🍜', categoryId: 2 },
  { name: '탕수육', emoji: '🍖', categoryId: 2 },
  { name: '마파두부', emoji: '🥘', categoryId: 2 },
  { name: '마라탕', emoji: '🍲', categoryId: 2 },
  { name: '양장피', emoji: '🥗', categoryId: 2 },
  { name: '깐풍기', emoji: '🍗', categoryId: 2 },
  { name: '유린기', emoji: '🍗', categoryId: 2 },
  { name: '볶음밥', emoji: '🍚', categoryId: 2 },
  { name: '만두', emoji: '🥟', categoryId: 2 },

  // 양식
  { name: '파스타', emoji: '🍝', categoryId: 3 },
  { name: '피자', emoji: '🍕', categoryId: 3 },
  { name: '햄버거', emoji: '🍔', categoryId: 3 },
  { name: '스테이크', emoji: '🥩', categoryId: 3 },
  { name: '리조또', emoji: '🍚', categoryId: 3 },
  { name: '오믈렛', emoji: '🍳', categoryId: 3 },
  { name: '샐러드', emoji: '🥗', categoryId: 3 },
  { name: '샌드위치', emoji: '🥪', categoryId: 3 },
  { name: '치킨', emoji: '🍗', categoryId: 3 },
  { name: '감자튀김', emoji: '🍟', categoryId: 3 },

  // 일식
  { name: '초밥', emoji: '🍣', categoryId: 4 },
  { name: '라멘', emoji: '🍜', categoryId: 4 },
  { name: '돈카츠', emoji: '🍱', categoryId: 4 },
  { name: '우동', emoji: '🍜', categoryId: 4 },
  { name: '사시미', emoji: '🍣', categoryId: 4 },
  { name: '규동', emoji: '🍚', categoryId: 4 },
  { name: '카레', emoji: '🍛', categoryId: 4 },
  { name: '타코야키', emoji: '🐙', categoryId: 4 },
  { name: '오코노미야키', emoji: '🥞', categoryId: 4 },
  { name: '텐동', emoji: '🍤', categoryId: 4 },

  // 분식
  { name: '떡볶이', emoji: '🍢', categoryId: 5 },
  { name: '순대', emoji: '🌭', categoryId: 5 },
  { name: '튀김', emoji: '🍤', categoryId: 5 },
  { name: '김밥', emoji: '🍙', categoryId: 5 },
  { name: '라면', emoji: '🍜', categoryId: 5 },
  { name: '쫄면', emoji: '🍜', categoryId: 5 },
  { name: '비빔당면', emoji: '🍜', categoryId: 5 },
  { name: '오뎅', emoji: '🍢', categoryId: 5 },
  { name: '호떡', emoji: '🥞', categoryId: 5 },
  { name: '붕어빵', emoji: '🐟', categoryId: 5 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // 기존 데이터 삭제
  await prisma.history.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.category.deleteMany()

  // 카테고리 생성
  console.log('📁 Creating categories...')
  for (const category of categories) {
    await prisma.category.create({
      data: category,
    })
  }

  // 메뉴 생성
  console.log('🍽️ Creating menus...')
  for (const menu of menus) {
    await prisma.menu.create({
      data: menu,
    })
  }

  console.log('✅ Seeding completed!')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${menus.length} menus`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
