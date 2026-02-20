<script setup lang="ts">
import { showcase } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import img0263 from '@/assets/images/IMG_0263.PNG'
import img0264 from '@/assets/images/IMG_0264.PNG'
import img0265 from '@/assets/images/IMG_0265.PNG'

const { elementRef, isVisible } = useScrollReveal()
const screenshots = [img0263, img0264, img0265]
</script>

<template>
  <section id="showcase" ref="elementRef" class="py-20 bg-background" aria-labelledby="showcase-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="showcase.headline"
        :description="showcase.description"
      />
      <div
        class="grid md:grid-cols-3 gap-8 justify-items-center"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div
          v-for="(recipe, i) in showcase.recipes"
          :key="recipe.title"
          class="text-center"
          :class="isVisible ? `animate-fade-in-up stagger-${i + 1}` : ''"
        >
          <!-- Phone mockup -->
          <div class="inline-block bg-text-primary rounded-[32px] p-2.5 shadow-xl mb-4">
            <div class="bg-surface rounded-[24px] overflow-hidden w-52">
              <img
                :src="screenshots[i]"
                :alt="recipe.title + ' — extracted in FoodProcessor'"
                class="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-text-primary">{{ recipe.title }}</h3>
          <p class="text-sm text-text-secondary">{{ recipe.subtitle }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
