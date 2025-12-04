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
      // 결과 계산
      const normalizedRotation = currentRotation.value % (2 * Math.PI)
      const sliceAngle = (2 * Math.PI) / props.menus.length
      // 포인터가 상단에 있으므로, 현재 회전에서 어떤 섹터가 상단을 가리키는지 계산
      const adjustedRotation = (2 * Math.PI - normalizedRotation + Math.PI / 2) % (2 * Math.PI)
      const selectedIndex = Math.floor(adjustedRotation / sliceAngle) % props.menus.length
      const selectedMenu = props.menus[selectedIndex]
      if (selectedMenu) {
        emit('spinEnd', selectedMenu)
      }
    }
  }

  isAnimating.value = true
  requestAnimationFrame(animate)
}

// 스핀 시작 감지
watch(() => props.isSpinning, (spinning) => {
  if (spinning && !isAnimating.value && props.menus.length > 0) {
    // 랜덤 회전량 (최소 5바퀴 + 랜덤)
    const minSpins = 5
    const maxExtraSpins = 3
    const randomSpins = minSpins + Math.random() * maxExtraSpins
    const randomOffset = Math.random() * 2 * Math.PI
    targetRotation.value = currentRotation.value + randomSpins * 2 * Math.PI + randomOffset
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
