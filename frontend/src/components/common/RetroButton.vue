<script setup lang="ts">
interface Props {
  variant?: 'pink' | 'cyan' | 'yellow' | 'green'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pink',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    // TODO: 8bit 사운드 재생
    emit('click', event)
  }
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
}

const variantClasses = {
  pink: 'border-neon-pink text-neon-pink hover:bg-neon-pink hover:shadow-neon-pink',
  cyan: 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:shadow-neon-cyan',
  yellow: 'border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:shadow-neon-yellow',
  green: 'border-neon-green text-neon-green hover:bg-neon-green hover:shadow-neon-green',
}
</script>

<template>
  <button
    :class="[
      'font-pixel border-3 bg-transparent cursor-pointer transition-all duration-200',
      'hover:text-retro-bg active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none',
      sizeClasses[size],
      variantClasses[variant],
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
