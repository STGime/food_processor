<script setup lang="ts">
import { hero } from '@/data/content'
import CtaButton from '@/components/ui/CtaButton.vue'
import demoVideo from '@/assets/videos/FoodProcessor_compressed.mp4'
</script>

<template>
  <section id="hero" class="relative overflow-hidden bg-gradient-to-b from-green-50 to-background pt-28 pb-20" aria-labelledby="hero-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="animate-fade-in-up">
          <h1 id="hero-heading" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
            {{ hero.headline }}
          </h1>
          <p class="text-lg sm:text-xl text-text-secondary mb-8 max-w-lg">
            {{ hero.subheadline }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative">
              <CtaButton :href="hero.appStoreUrl" size="large">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Download for iOS
              </CtaButton>
              <span class="absolute -top-2.5 -right-2.5 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                COMING SOON
              </span>
            </div>
            <div class="relative">
              <CtaButton variant="secondary" href="#" size="large">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24C14.86 8.35 13.47 8 12 8s-2.86.35-4.47.91L5.65 5.67c-.18-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>
                Download for Android
              </CtaButton>
              <span class="absolute -top-2.5 -right-2.5 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                COMING SOON
              </span>
            </div>
          </div>
        </div>
        <div class="animate-fade-in-up stagger-2 flex justify-center lg:justify-end">
          <div class="relative w-72 sm:w-80">
            <!-- Phone mockup frame -->
            <div class="bg-text-primary rounded-[40px] p-3 shadow-2xl">
              <div class="bg-surface rounded-[32px] overflow-hidden aspect-[9/19.5]">
                <video
                  :src="demoVideo"
                  autoplay
                  loop
                  muted
                  playsinline
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
