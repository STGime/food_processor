<script setup lang="ts">
const testimonials = [
  {
    name: 'Chad Buttersworth',
    title: 'Professional Couch Chef',
    stars: 5,
    quote: 'I used to pause YouTube videos 847 times per recipe. My therapist says I\'m a new person.',
    avatar: '👨‍🦰',
    bg: 'from-red-100 to-orange-100',
  },
  {
    name: 'Grandma WiFi',
    title: 'Tech-Savvy Nonna',
    stars: 5,
    quote: 'My grandson showed me this app. Now I extract recipes faster than he can eat them. He\'s gaining weight. I\'m so proud.',
    avatar: '👵',
    bg: 'from-purple-100 to-pink-100',
  },
  {
    name: 'Derek Flames',
    title: 'Aspiring Gordon Ramsay',
    stars: 4,
    quote: 'The app correctly identified "a pinch of salt" as an ingredient. My ex-wife never could. 5 stars but I\'m still angry.',
    avatar: '👨‍🍳',
    bg: 'from-yellow-100 to-amber-100',
  },
  {
    name: 'Samantha Spork',
    title: 'Utensil Influencer',
    stars: 5,
    quote: 'Finally, an app that understands me. I showed it a 45-minute video and it gave me a shopping list in 10 seconds. I cried.',
    avatar: '💁‍♀️',
    bg: 'from-teal-100 to-cyan-100',
  },
  {
    name: 'Kevin Microwave',
    title: 'Reheating Specialist',
    stars: 5,
    quote: 'I\'ve never actually cooked any of these recipes but my shopping lists are IMMACULATE.',
    avatar: '🧔',
    bg: 'from-blue-100 to-indigo-100',
  },
  {
    name: 'Pasta La Vista',
    title: 'Anonymous Carb Lover',
    stars: 5,
    quote: 'My doctor said I need to eat more vegetables. So I extracted a salad recipe. Then I made pasta. But still. Progress.',
    avatar: '🥸',
    bg: 'from-green-100 to-emerald-100',
  },
  {
    name: 'Brenda Burnt-Toast',
    title: 'Kitchen Survivor',
    stars: 5,
    quote: 'The AI extracted 23 ingredients from a Gordon Ramsay video. I only set off the smoke alarm twice. Personal best.',
    avatar: '👩‍🦱',
    bg: 'from-rose-100 to-red-100',
  },
  {
    name: 'Sir Snacks-a-Lot',
    title: 'Midnight Fridge Raider',
    stars: 5,
    quote: 'I paste cooking videos at 2am while eating cereal. I have 200 saved recipes and zero cooked meals. Living the dream.',
    avatar: '🤴',
    bg: 'from-violet-100 to-purple-100',
  },
  {
    name: 'Tomato Karen',
    title: 'Yelp Elite Reviewer',
    stars: 3,
    quote: 'The app said "2 cloves of garlic." I used 14. That\'s not the app\'s fault but I\'m leaving 3 stars anyway.',
    avatar: '💇‍♀️',
    bg: 'from-orange-100 to-yellow-100',
  },
  {
    name: 'Chef Boyar-Dad',
    title: 'Father of Picky Eaters',
    stars: 5,
    quote: 'Extracted a recipe with 15 vegetables. My kids ate none of them. But the SHOPPING LIST was beautiful.',
    avatar: '👴',
    bg: 'from-sky-100 to-blue-100',
  },
]

// Double the list for seamless infinite scroll
const scrollItems = [...testimonials, ...testimonials]
</script>

<template>
  <section class="py-12 bg-background overflow-hidden">
    <div class="relative">
      <!-- Row 1: scrolls left -->
      <div class="flex gap-5 mb-5 animate-scroll-left">
        <div
          v-for="(t, i) in scrollItems.slice(0, 10)"
          :key="'a' + i"
          class="flex-shrink-0 w-80 bg-surface rounded-[14px] border border-divider p-5 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br"
              :class="t.bg"
            >
              {{ t.avatar }}
            </div>
            <div>
              <div class="font-semibold text-text-primary text-sm">{{ t.name }}</div>
              <div class="text-text-secondary text-xs">{{ t.title }}</div>
            </div>
          </div>
          <div class="flex gap-0.5 mb-2">
            <span v-for="s in 5" :key="s" class="text-sm" :class="s <= t.stars ? 'text-amber-400' : 'text-gray-200'">&#9733;</span>
          </div>
          <p class="text-sm text-text-secondary leading-relaxed italic">"{{ t.quote }}"</p>
        </div>
      </div>

      <!-- Row 2: scrolls right -->
      <div class="flex gap-5 animate-scroll-right">
        <div
          v-for="(t, i) in [...scrollItems.slice(5, 10), ...scrollItems.slice(0, 5)]"
          :key="'b' + i"
          class="flex-shrink-0 w-80 bg-surface rounded-[14px] border border-divider p-5 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br"
              :class="t.bg"
            >
              {{ t.avatar }}
            </div>
            <div>
              <div class="font-semibold text-text-primary text-sm">{{ t.name }}</div>
              <div class="text-text-secondary text-xs">{{ t.title }}</div>
            </div>
          </div>
          <div class="flex gap-0.5 mb-2">
            <span v-for="s in 5" :key="s" class="text-sm" :class="s <= t.stars ? 'text-amber-400' : 'text-gray-200'">&#9733;</span>
          </div>
          <p class="text-sm text-text-secondary leading-relaxed italic">"{{ t.quote }}"</p>
        </div>
      </div>
    </div>
  </section>
</template>
