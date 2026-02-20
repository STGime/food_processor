<script setup lang="ts">
import { footer } from '@/data/content'
</script>

<template>
  <footer class="bg-text-primary py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 mb-3">
            <img src="@/assets/images/icon.png" alt="FoodProcessor" class="w-8 h-8 rounded-lg" />
            <span class="font-bold text-white text-lg">{{ footer.brand.name }}</span>
          </div>
          <p class="text-gray-400 text-sm max-w-xs">{{ footer.brand.tagline }}</p>
        </div>

        <!-- Link columns -->
        <div v-for="column in footer.columns" :key="column.title">
          <h4 class="text-white font-semibold text-sm mb-3">{{ column.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in column.links" :key="link.label">
              <router-link
                v-if="link.href.startsWith('/')"
                :to="link.href"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ link.label }}
              </router-link>
              <a
                v-else
                :href="link.href"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-gray-700 text-center">
        <p class="text-gray-500 text-sm">&copy; {{ new Date().getFullYear() }} FoodProcessor. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
