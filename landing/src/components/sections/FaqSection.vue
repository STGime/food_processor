<script setup lang="ts">
import { ref } from 'vue'
import { faq } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const { elementRef, isVisible } = useScrollReveal()
const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section id="faq" ref="elementRef" class="py-20 bg-background" aria-labelledby="faq-heading">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="faq.headline"
        :description="faq.description"
      />
      <div
        class="space-y-3"
        :class="isVisible ? 'animate-fade-in-up' : 'opacity-0'"
      >
        <div
          v-for="(item, i) in faq.items"
          :key="i"
          class="bg-surface rounded-[14px] border border-divider overflow-hidden"
        >
          <button
            class="w-full flex items-center justify-between p-5 text-left cursor-pointer"
            @click="toggle(i)"
            :aria-expanded="openIndex === i"
          >
            <span class="font-semibold text-text-primary pr-4">{{ item.question }}</span>
            <span
              class="text-text-secondary transition-transform duration-200 shrink-0"
              :class="openIndex === i ? 'rotate-180' : ''"
            >
              &#9662;
            </span>
          </button>
          <div
            class="overflow-hidden transition-all duration-200"
            :class="openIndex === i ? 'max-h-96 pb-5' : 'max-h-0'"
          >
            <p class="px-5 text-text-secondary leading-relaxed">
              {{ item.answer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
