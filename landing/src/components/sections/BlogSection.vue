<script setup lang="ts">
import { blog } from '@/data/content'
import { useScrollReveal } from '@/composables/useScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="blog" ref="elementRef" class="py-20 bg-surface" aria-labelledby="blog-heading">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :heading="blog.headline"
        :description="blog.description"
      />
      <div
        class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <router-link
          v-for="(post, i) in blog.posts"
          :key="post.slug"
          :to="`/blog/${post.slug}`"
          class="bg-background rounded-[14px] border border-divider overflow-hidden hover:shadow-md transition-shadow duration-200 group"
          :class="isVisible ? `animate-fade-in-up stagger-${i + 1}` : ''"
        >
          <div class="h-36 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-200">{{ post.image }}</span>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{{ post.category }}</span>
              <span class="text-xs text-text-secondary">{{ post.readTime }}</span>
            </div>
            <h3 class="font-semibold text-text-primary mb-2 leading-snug group-hover:text-primary transition-colors">
              {{ post.title }}
            </h3>
            <p class="text-sm text-text-secondary leading-relaxed">
              {{ post.excerpt }}
            </p>
          </div>
        </router-link>
      </div>
      <div class="text-center mt-10">
        <router-link
          to="/blog"
          class="inline-flex items-center gap-1 text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          View All Posts &rarr;
        </router-link>
      </div>
    </div>
  </section>
</template>
