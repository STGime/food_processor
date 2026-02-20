<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { getPostBySlug } from '@/data/blog'
import { useHead } from '@/composables/useHead'

const route = useRoute()
const post = computed(() => getPostBySlug(route.params.slug as string))
const renderedContent = computed(() => post.value ? marked(post.value.content) : '')

useHead({
  title: computed(() => post.value ? `${post.value.title} — FoodProcessor Blog` : 'Blog Post — FoodProcessor'),
  description: computed(() => post.value?.excerpt || 'Read cooking tips and recipes on the FoodProcessor blog.'),
  ogUrl: computed(() => `https://foodprocessor.app/blog/${route.params.slug}`),
  ogType: 'article',
})
</script>

<template>
  <main class="pt-24 pb-16 bg-background">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <template v-if="post">
        <router-link to="/blog" class="text-primary text-sm font-medium hover:text-primary-dark transition-colors mb-6 inline-block">
          &larr; Back to Blog
        </router-link>
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{{ post.category }}</span>
          <span class="text-xs text-text-secondary">{{ post.date }}</span>
          <span class="text-xs text-text-secondary">{{ post.readTime }}</span>
        </div>
        <article
          class="prose prose-gray max-w-none
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-text-primary [&_h1]:mb-6
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
            [&_li]:text-text-secondary [&_li]:leading-relaxed
            [&_strong]:text-text-primary [&_strong]:font-semibold
            [&_em]:italic
            [&_hr]:my-8 [&_hr]:border-divider
            [&_table]:w-full [&_table]:mb-4 [&_table]:text-sm
            [&_th]:text-left [&_th]:text-text-primary [&_th]:font-semibold [&_th]:pb-2 [&_th]:border-b [&_th]:border-divider [&_th]:pr-4
            [&_td]:text-text-secondary [&_td]:py-2 [&_td]:border-b [&_td]:border-divider/50 [&_td]:pr-4
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-secondary
            [&_code]:bg-gray-100 [&_code]:text-sm [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
          "
          v-html="renderedContent"
        />
      </template>
      <template v-else>
        <div class="text-center py-20">
          <p class="text-text-secondary text-lg mb-4">Post not found.</p>
          <router-link to="/blog" class="text-primary font-medium hover:text-primary-dark transition-colors">
            &larr; Back to Blog
          </router-link>
        </div>
      </template>
    </div>
  </main>
</template>
