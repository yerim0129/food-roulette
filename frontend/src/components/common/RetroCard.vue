<script setup lang="ts">
interface Props {
  borderColor?: 'pink' | 'cyan' | 'yellow' | 'green' | 'orange' | 'purple'
  hoverable?: boolean
}

const { borderColor, hoverable } = withDefaults(defineProps<Props>(), {
  borderColor: 'cyan',
  hoverable: true,
})

const borderClasses = {
  pink: 'border-neon-pink',
  cyan: 'border-neon-cyan',
  yellow: 'border-neon-yellow',
  green: 'border-neon-green',
  orange: 'border-neon-orange',
  purple: 'border-neon-purple',
}

const glowClasses = {
  pink: 'hover:shadow-neon-pink',
  cyan: 'hover:shadow-neon-cyan',
  yellow: 'hover:shadow-neon-yellow',
  green: 'hover:shadow-neon-green',
  orange: 'hover:shadow-neon-orange',
  purple: 'hover:shadow-neon-purple',
}
</script>

<template>
  <div
    :class="[
      'bg-retro-card/80 backdrop-blur-sm p-6 border-2 transition-all duration-300',
      borderClasses[borderColor],
      hoverable && glowClasses[borderColor],
    ]"
  >
    <slot />
  </div>
</template>
