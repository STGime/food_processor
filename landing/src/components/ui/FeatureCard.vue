<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="bg-surface rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-divider">
    <div class="text-4xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-text-primary mb-2">{{ title }}</h3>
    <p class="text-text-secondary text-sm leading-relaxed">{{ description }}</p>
  </div>
</template>
