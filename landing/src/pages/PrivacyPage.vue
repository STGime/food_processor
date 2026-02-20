<script setup lang="ts">
import { useHead } from '@/composables/useHead'

useHead({
  title: 'Privacy Policy — FoodProcessor',
  description: 'Learn how FoodProcessor collects, uses, and protects your information. We use anonymous device IDs and do not require account creation.',
  ogUrl: 'https://foodprocessor.app/privacy',
})
</script>

<template>
  <main class="pt-24 pb-16 bg-background">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-text-primary mb-8">Privacy Policy</h1>
      <div class="prose prose-gray max-w-none space-y-6 text-text-secondary leading-relaxed">
        <p><strong class="text-text-primary">Last updated:</strong> February 2026</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">1. Introduction</h2>
        <p>FoodProcessor ("we", "our", "the app") is a mobile application that extracts structured recipes from YouTube cooking videos. This Privacy Policy explains how we collect, use, and protect your information.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">2. Information We Collect</h2>
        <p><strong class="text-text-primary">Device Information:</strong> We generate an anonymous device identifier to associate your recipes and preferences. We do not require account creation or collect personal information such as name, email, or phone number.</p>
        <p><strong class="text-text-primary">YouTube URLs:</strong> When you submit a YouTube URL, we process it through our AI service to extract recipe data. We store the video URL and extracted recipe content associated with your device ID.</p>
        <p><strong class="text-text-primary">Usage Data:</strong> We collect anonymous analytics data including app usage patterns, feature interactions, and error reports to improve the app experience.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">3. How We Use Your Information</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>To extract and store recipes from YouTube videos you submit</li>
          <li>To generate shopping lists and cooking instructions</li>
          <li>To provide ingredient swap suggestions</li>
          <li>To manage your subscription status</li>
          <li>To improve our AI extraction accuracy and app experience</li>
        </ul>

        <h2 class="text-xl font-semibold text-text-primary mt-8">4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong class="text-text-primary">Google Gemini AI:</strong> For processing YouTube video content and extracting recipe data. Video URLs are sent to Google's API for analysis.</li>
          <li><strong class="text-text-primary">RevenueCat:</strong> For managing in-app subscriptions and purchase verification.</li>
          <li><strong class="text-text-primary">Neon Database:</strong> For secure cloud storage of recipe data.</li>
          <li><strong class="text-text-primary">Google Cloud:</strong> For hosting our backend services.</li>
        </ul>

        <h2 class="text-xl font-semibold text-text-primary mt-8">5. Data Retention</h2>
        <p>Your recipe data is retained as long as you use the app. Since we identify users by device ID only, uninstalling the app and clearing your device data effectively removes your association with stored data.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">6. Data Security</h2>
        <p>We use industry-standard security measures including encrypted connections (HTTPS/TLS), secure cloud infrastructure, and access controls to protect your data.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">7. Children's Privacy</h2>
        <p>FoodProcessor is not directed at children under 13. We do not knowingly collect information from children.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be reflected with an updated "Last updated" date at the top of this page.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">9. Contact</h2>
        <p>If you have questions about this Privacy Policy, please contact us through the app's support feature.</p>
      </div>
    </div>
  </main>
</template>
