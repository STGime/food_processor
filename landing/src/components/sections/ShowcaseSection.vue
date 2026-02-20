<script setup lang="ts">
import { showcase } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="showcase" ref="elementRef" class="py-20 bg-background" aria-labelledby="showcase-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="showcase.headline"
        :description="showcase.description"
      />
      <div
        class="grid md:grid-cols-3 gap-6"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div
          v-for="(recipe, i) in showcase.recipes"
          :key="recipe.title"
          class="bg-surface rounded-[14px] overflow-hidden shadow-sm border border-divider hover:shadow-md transition-shadow duration-200"
          :class="isVisible ? `animate-fade-in-up stagger-${i + 1}` : ''"
        >
          <div class="h-2" :style="{ backgroundColor: recipe.color }" />
          <div class="p-6">
            <h3 class="text-lg font-semibold text-text-primary mb-1">{{ recipe.title }}</h3>
            <p class="text-xs text-text-secondary mb-4">{{ recipe.source }}</p>
            <div class="space-y-2">
              <div
                v-for="ingredient in recipe.ingredients"
                :key="ingredient"
                class="flex items-center gap-2"
              >
                <span class="text-primary text-sm">&#10003;</span>
                <span class="text-sm text-text-primary">{{ ingredient }}</span>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-divider">
              <span class="text-xs text-text-secondary">{{ recipe.ingredients.length }} ingredients extracted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
