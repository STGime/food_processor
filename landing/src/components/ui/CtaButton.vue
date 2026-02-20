<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'premium'
  href?: string
  size?: 'default' | 'large'
}>()
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer"
    :class="[
      size === 'large' ? 'h-14 px-8 text-lg rounded-[28px]' : 'h-12 px-6 text-base rounded-3xl',
      variant === 'secondary'
        ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
        : variant === 'premium'
          ? 'bg-accent text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
          : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl',
    ]"
  >
    <slot />
  </a>
  <button
    v-else
    class="inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer"
    :class="[
      size === 'large' ? 'h-14 px-8 text-lg rounded-[28px]' : 'h-12 px-6 text-base rounded-3xl',
      variant === 'secondary'
        ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
        : variant === 'premium'
          ? 'bg-accent text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
          : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl',
    ]"
  >
    <slot />
  </button>
</template>
