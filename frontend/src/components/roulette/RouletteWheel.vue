<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Food } from '@/types'

interface Props {
  menus: Food[]
  isSpinning: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  spinEnd: [menu: Food]
}>()

// 미리 선택된 결과 (스핀 시작 시 결정)
const preSelectedMenu = ref<Food | null>(null)

// 네온 색상 타입
interface NeonColor {
  bg: string
  border: string
}

// 네온 색상 팔레트 (카테고리별)
const neonColors: NeonColor[] = [
  { bg: '#ff2d6a', border: '#ff6b9d' }, // pink
  { bg: '#00fff2', border: '#66ffff' }, // cyan
  { bg: '#fffc00', border: '#fffd66' }, // yellow
  { bg: '#00ff66', border: '#66ff99' }, // green
  { bg: '#ff9500', border: '#ffb366' }, // orange
  { bg: '#a855f7', border: '#c084fc' }, // purple
]

const defaultColor: NeonColor = { bg: '#ff2d6a', border: '#ff6b9d' }

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentRotation = ref(0)
const targetRotation = ref(0)
const isAnimating = ref(false)

// 휠 사이즈
const WHEEL_SIZE = 320
const CENTER = WHEEL_SIZE / 2

// 카테고리별 색상 매핑
const getCategoryColor = (categoryId: number): NeonColor => {
  const index = (categoryId - 1) % neonColors.length
  return neonColors[index] ?? defaultColor
}

// 휠 그리기
const drawWheel = () => {
  const canvas = canvasRef.value
  if (!canvas || props.menus.length === 0) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const menuCount = props.menus.length
  const sliceAngle = (2 * Math.PI) / menuCount
  const radius = CENTER - 10

  // 캔버스 초기화
  ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE)

  // 현재 회전 적용
  ctx.save()
  ctx.translate(CENTER, CENTER)
  ctx.rotate(currentRotation.value)
  ctx.translate(-CENTER, -CENTER)

  // 각 섹터 그리기
  props.menus.forEach((menu, index) => {
    const startAngle = index * sliceAngle - Math.PI / 2
    const endAngle = startAngle + sliceAngle
    const color = getCategoryColor(menu.categoryId)

    // 섹터 배경
    ctx.beginPath()
    ctx.moveTo(CENTER, CENTER)
    ctx.arc(CENTER, CENTER, radius, startAngle, endAngle)
    ctx.closePath()

    // 그라데이션 효과
    const gradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, radius)
    gradient.addColorStop(0, '#16213e')
    gradient.addColorStop(0.3, '#16213e')
    gradient.addColorStop(1, color.bg + '40')
    ctx.fillStyle = gradient
    ctx.fill()

    // 섹터 테두리
    ctx.strokeStyle = color.bg
    ctx.lineWidth = 2
    ctx.stroke()

    // 네온 글로우 효과
    ctx.shadowColor = color.bg
    ctx.shadowBlur = 10
    ctx.stroke()
    ctx.shadowBlur = 0

    // 텍스트 그리기
    ctx.save()
    ctx.translate(CENTER, CENTER)
    ctx.rotate(startAngle + sliceAngle / 2)

    // 이모지
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(menu.emoji, radius * 0.65, 0)

    // 메뉴명 (짧게 표시)
    const displayName = menu.name.length > 4 ? menu.name.slice(0, 4) + '..' : menu.name
    ctx.font = '10px "Press Start 2P", "DungGeunMo", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = color.bg
    ctx.shadowBlur = 5
    ctx.fillText(displayName, radius * 0.4, 0)
    ctx.shadowBlur = 0

    ctx.restore()
  })

  // 중앙 원
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, 30, 0, 2 * Math.PI)
  const centerGradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 30)
  centerGradient.addColorStop(0, '#16213e')
  centerGradient.addColorStop(1, '#0f0f23')
  ctx.fillStyle = centerGradient
  ctx.fill()
  ctx.strokeStyle = '#00fff2'
  ctx.lineWidth = 3
  ctx.shadowColor = '#00fff2'
  ctx.shadowBlur = 15
  ctx.stroke()
  ctx.shadowBlur = 0

  // 중앙 텍스트
  ctx.font = '12px "Press Start 2P", sans-serif'
  ctx.fillStyle = '#00fff2'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SPIN', CENTER, CENTER)

  ctx.restore()
}

// easeOut 함수
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

// 회전 애니메이션
const animateSpin = () => {
  const duration = 4000 // 4초
  const startRotation = currentRotation.value
  const totalRotation = targetRotation.value - startRotation
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeOutCubic(progress)

    currentRotation.value = startRotation + totalRotation * easeProgress
    drawWheel()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
      // 실제 포인터가 가리키는 메뉴를 계산하여 emit (100% 정확)
      const actualIndex = getMenuIndexAtPointer(currentRotation.value)
      const actualMenu = props.menus[actualIndex]
      if (actualMenu) {
        emit('spinEnd', actualMenu)
      }
      preSelectedMenu.value = null
    }
  }

  isAnimating.value = true
  requestAnimationFrame(animate)
}

// 현재 휠 회전 상태에서 포인터가 가리키는 메뉴 인덱스 계산
const getMenuIndexAtPointer = (rotation: number): number => {
  const menuCount = props.menus.length
  if (menuCount === 0) return 0

  const sliceAngle = (2 * Math.PI) / menuCount

  // 휠 그리기: 섹터 i는 (i * sliceAngle - PI/2) ~ ((i+1) * sliceAngle - PI/2)
  // 포인터는 상단(12시, 각도 -PI/2 또는 270도)에 고정
  // 휠이 rotation만큼 회전하면, 포인터 기준 각도는 -rotation
  // 포인터가 가리키는 휠상의 원래 각도: -PI/2 - rotation

  // 정규화: 0 ~ 2PI 범위로
  let pointerAngle = (-Math.PI / 2 - rotation) % (2 * Math.PI)
  if (pointerAngle < 0) pointerAngle += 2 * Math.PI

  // 섹터 i의 범위: (i * sliceAngle) ~ ((i+1) * sliceAngle)
  // 단, 휠 그리기에서 -PI/2 오프셋을 적용했으므로 이를 고려
  // 실제로는 pointerAngle에 PI/2를 더해서 0기준으로 맞춤
  let adjustedAngle = (pointerAngle + Math.PI / 2) % (2 * Math.PI)

  const index = Math.floor(adjustedAngle / sliceAngle) % menuCount
  return index
}

// 스핀 시작 감지
watch(() => props.isSpinning, (spinning) => {
  if (spinning && !isAnimating.value && props.menus.length > 0) {
    const menuCount = props.menus.length
    const sliceAngle = (2 * Math.PI) / menuCount

    // 1. 랜덤으로 결과 메뉴 선택
    const randomIndex = Math.floor(Math.random() * menuCount)
    preSelectedMenu.value = props.menus[randomIndex] ?? null

    // 2. 최소 회전량 (5~7바퀴)
    const minSpins = 5
    const extraSpins = Math.random() * 2
    const baseRotation = (minSpins + extraSpins) * 2 * Math.PI

    // 3. 선택된 섹터의 중앙이 포인터(상단)에 오도록 목표 회전량 계산
    // 섹터 i의 중앙 각도 (휠 기준): i * sliceAngle + sliceAngle/2 - PI/2
    // 이 각도가 포인터(-PI/2)에 오려면, 휠이 (i * sliceAngle + sliceAngle/2)만큼 회전해야 함
    const targetSectorCenter = randomIndex * sliceAngle + sliceAngle / 2

    // 현재 회전을 0~2PI로 정규화
    const currentNormalized = ((currentRotation.value % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    // 목표 회전량: 기본 회전 + (목표 섹터 위치 - 현재 위치)
    let additionalRotation = targetSectorCenter - currentNormalized
    if (additionalRotation < 0) additionalRotation += 2 * Math.PI

    targetRotation.value = currentRotation.value + baseRotation + additionalRotation

    animateSpin()
  }
})

// 메뉴 변경 시 다시 그리기
watch(() => props.menus, () => {
  drawWheel()
}, { deep: true })

onMounted(() => {
  drawWheel()
})

// 휠 크기 계산
const wheelStyle = computed(() => ({
  width: `${WHEEL_SIZE}px`,
  height: `${WHEEL_SIZE}px`,
}))
</script>

<template>
  <div class="relative inline-block">
    <!-- 외부 글로우 링 -->
    <div
      class="absolute inset-0 rounded-full animate-pulse-neon"
      :style="{
        ...wheelStyle,
        boxShadow: '0 0 30px #ff2d6a, 0 0 60px #00fff2, inset 0 0 30px rgba(0,255,242,0.1)',
        border: '4px solid #ff2d6a',
      }"
    />

    <!-- 포인터 (상단 화살표) -->
    <div class="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
      <div class="relative">
        <!-- 글로우 효과 -->
        <div
          class="absolute inset-0"
          style="filter: blur(8px);"
        >
          <svg width="40" height="50" viewBox="0 0 40 50">
            <polygon
              points="20,50 0,15 20,25 40,15"
              fill="#fffc00"
            />
          </svg>
        </div>
        <!-- 실제 포인터 -->
        <svg width="40" height="50" viewBox="0 0 40 50" class="relative">
          <polygon
            points="20,50 0,15 20,25 40,15"
            fill="#fffc00"
            stroke="#ff9500"
            stroke-width="2"
          />
          <polygon
            points="20,45 5,18 20,26 35,18"
            fill="#0f0f23"
          />
        </svg>
      </div>
    </div>

    <!-- 캔버스 휠 -->
    <canvas
      ref="canvasRef"
      :width="WHEEL_SIZE"
      :height="WHEEL_SIZE"
      :style="wheelStyle"
      class="relative z-10 rounded-full"
    />

    <!-- 스피닝 이펙트 -->
    <div
      v-if="isSpinning"
      class="absolute inset-0 rounded-full pointer-events-none z-30"
      :style="{
        ...wheelStyle,
        background: 'radial-gradient(circle, transparent 30%, rgba(255,45,106,0.2) 100%)',
        animation: 'pulse 0.3s ease-in-out infinite',
      }"
    />
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
