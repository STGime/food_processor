<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nav } from '@/data/content'
import { useSmoothScroll } from '@/composables/useSmoothScroll'

const route = useRoute()
const router = useRouter()
const { scrollToSection } = useSmoothScroll()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function handleNavClick(href: string) {
  isMenuOpen.value = false
  if (href.startsWith('#')) {
    if (route.path !== '/') {
      router.push('/' + href)
    } else {
      scrollToSection(href.slice(1))
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
    :class="isScrolled ? 'bg-surface/95 backdrop-blur-md shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2">
          <img src="@/assets/images/icon.png" alt="FoodProcessor" class="w-8 h-8 rounded-lg" />
          <span class="font-bold text-text-primary text-lg">FoodProcessor</span>
        </router-link>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-6">
          <a
            v-for="link in nav.links"
            :key="link.label"
            :href="link.href"
            class="text-text-secondary hover:text-primary transition-colors text-sm font-medium"
            @click.prevent="handleNavClick(link.href)"
          >
            {{ link.label }}
          </a>
          <a
            href="#"
            class="bg-primary text-white px-4 py-2 rounded-3xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Download
          </a>
        </div>

        <!-- Mobile hamburger -->
        <button
          class="md:hidden p-2 text-text-primary"
          @click="isMenuOpen = !isMenuOpen"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!isMenuOpen"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="isMenuOpen"
      class="md:hidden bg-surface border-t border-divider"
    >
      <div class="px-4 py-3 space-y-1">
        <a
          v-for="link in nav.links"
          :key="link.label"
          :href="link.href"
          class="block py-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium"
          @click.prevent="handleNavClick(link.href)"
        >
          {{ link.label }}
        </a>
        <a
          href="#"
          class="block mt-2 bg-primary text-white px-4 py-2 rounded-3xl text-sm font-semibold text-center hover:bg-primary-dark transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  </nav>
</template>
