<script setup lang="ts">
import { blogPosts } from '@/data/blog'
import SectionHeading from '@/components/ui/SectionHeading.vue'
</script>

<template>
  <main class="pt-24 pb-16 bg-background">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        heading="Recipes & Cooking Tips"
        description="Fresh ideas, smart techniques, and recipes worth making."
      />
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="post in blogPosts"
          :key="post.slug"
          :to="`/blog/${post.slug}`"
          class="bg-surface rounded-[14px] border border-divider overflow-hidden hover:shadow-md transition-shadow duration-200 group"
        >
          <div class="h-36 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-200">{{ post.image }}</span>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{{ post.category }}</span>
              <span class="text-xs text-text-secondary">{{ post.readTime }}</span>
            </div>
            <h2 class="font-semibold text-text-primary mb-2 leading-snug group-hover:text-primary transition-colors">
              {{ post.title }}
            </h2>
            <p class="text-sm text-text-secondary leading-relaxed">
              {{ post.excerpt }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </main>
</template>
