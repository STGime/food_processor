<script setup lang="ts">
import { useHead } from '@/composables/useHead'
import HeroSection from '@/components/sections/HeroSection.vue'

useHead({
  title: 'FoodProcessor — Turn Cooking Videos Into Recipes & Shopping Lists',
  description: 'Paste any YouTube cooking video and let AI extract a complete recipe card, ingredient list, and shopping list in seconds.',
  ogUrl: 'https://foodprocessor.app/',
})
import TestimonialsSection from '@/components/sections/TestimonialsSection.vue'
import BenefitsSection from '@/components/sections/BenefitsSection.vue'
import HowItWorksSection from '@/components/sections/HowItWorksSection.vue'
import ShowcaseSection from '@/components/sections/ShowcaseSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import FaqSection from '@/components/sections/FaqSection.vue'
import CtaSection from '@/components/sections/CtaSection.vue'
</script>

<template>
  <main>
    <HeroSection />
    <TestimonialsSection />
    <BenefitsSection />
    <HowItWorksSection />
    <ShowcaseSection />
    <BlogSection />
    <FaqSection />
    <CtaSection />
  </main>
</template>
