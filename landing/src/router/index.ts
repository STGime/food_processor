import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/pages/PrivacyPage.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/pages/TermsPage.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/pages/BlogIndexPage.vue'),
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('@/pages/BlogPostPage.vue'),
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
