<script setup lang="ts">
defineProps<{
  step: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="text-center">
    <div class="w-14 h-14 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
      {{ step }}
    </div>
    <h3 class="text-xl font-semibold text-text-primary mb-2">{{ title }}</h3>
    <p class="text-text-secondary leading-relaxed">{{ description }}</p>
  </div>
</template>
