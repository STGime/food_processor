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
            <CtaButton :href="hero.appStoreUrl" size="large">
              {{ hero.primaryCta }}
            </CtaButton>
            <CtaButton variant="secondary" href="#how-it-works" size="large">
              {{ hero.secondaryCta }}
            </CtaButton>
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
