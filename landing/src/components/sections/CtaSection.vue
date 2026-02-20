<script setup lang="ts">
import { cta } from '@/data/content'
import CtaButton from '@/components/ui/CtaButton.vue'
</script>

<template>
  <section class="py-20 bg-gradient-to-b from-green-50 to-surface" aria-labelledby="cta-heading">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 id="cta-heading" class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
        {{ cta.headline }}
      </h2>
      <p class="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
        {{ cta.description }}
      </p>
      <CtaButton :href="cta.appStoreUrl" size="large">
        {{ cta.primaryCta }}
      </CtaButton>
    </div>
  </section>
</template>
