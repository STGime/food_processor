<script setup lang="ts">
import { benefits } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import FeatureCard from '@/components/ui/FeatureCard.vue'

const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="benefits" ref="elementRef" class="py-20 bg-background" aria-labelledby="benefits-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="benefits.headline"
        :description="benefits.description"
      />
      <div
        class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <FeatureCard
          v-for="(feature, i) in benefits.features"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
          :class="isVisible ? `animate-fade-in-up stagger-${i + 1}` : ''"
        />
      </div>
    </div>
  </section>
</template>
