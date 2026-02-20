<script setup lang="ts">
defineProps<{
  subtitle?: string
  heading: string
  description?: string
}>()
</script>

<template>
  <div class="text-center max-w-2xl mx-auto mb-12">
    <p v-if="subtitle" class="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
      {{ subtitle }}
    </p>
    <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
      {{ heading }}
    </h2>
    <p v-if="description" class="text-text-secondary text-lg">
      {{ description }}
    </p>
  </div>
</template>
