<script setup lang="ts">
import { howItWorks } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import StepCard from '@/components/ui/StepCard.vue'

const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="how-it-works" ref="elementRef" class="py-20 bg-surface" aria-labelledby="how-it-works-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="howItWorks.headline"
        :description="howItWorks.description"
      />
      <div
        class="grid md:grid-cols-3 gap-8 relative"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <!-- Connector line -->
        <div class="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-divider" />
        <StepCard
          v-for="(step, i) in howItWorks.steps"
          :key="step.title"
          :step="step.step"
          :title="step.title"
          :description="step.description"
          class="relative"
          :class="isVisible ? `animate-fade-in-up stagger-${i + 1}` : ''"
        />
      </div>
    </div>
  </section>
</template>
