<script setup lang="ts">
import { useHead } from '@/composables/useHead'

useHead({
  title: 'Terms of Service — FoodProcessor',
  description: 'Terms of Service for FoodProcessor. Read about app usage, subscriptions, content ownership, AI accuracy disclaimer, and more.',
  ogUrl: 'https://foodprocessor.app/terms',
})
</script>

<template>
  <main class="pt-24 pb-16 bg-background">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-text-primary mb-8">Terms of Service</h1>
      <div class="prose prose-gray max-w-none space-y-6 text-text-secondary leading-relaxed">
        <p><strong class="text-text-primary">Last updated:</strong> February 2026</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">1. Acceptance of Terms</h2>
        <p>By downloading, installing, or using FoodProcessor ("the app"), you agree to be bound by these Terms of Service. If you do not agree, do not use the app.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">2. Description of Service</h2>
        <p>FoodProcessor is a mobile application that uses artificial intelligence to extract recipes, ingredients, and cooking instructions from YouTube cooking videos. The app generates shopping lists and recipe cards for personal use.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">3. User Obligations</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>You must be at least 13 years old to use the app</li>
          <li>You are responsible for the YouTube URLs you submit</li>
          <li>You agree not to use the app for any unlawful purpose</li>
          <li>You agree not to attempt to reverse-engineer, modify, or interfere with the app's operation</li>
        </ul>

        <h2 class="text-xl font-semibold text-text-primary mt-8">4. Subscriptions and Billing</h2>
        <p><strong class="text-text-primary">Free Tier:</strong> The app offers a free tier with limited functionality, including extraction of up to 5 ingredients per recipe.</p>
        <p><strong class="text-text-primary">Premium Subscription:</strong> Premium features are available for $3.99/month, billed through the Apple App Store. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current billing period.</p>
        <p><strong class="text-text-primary">Cancellation:</strong> You can cancel your subscription at any time through your App Store account settings. No refunds are provided for partial billing periods.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">5. Content and Intellectual Property</h2>
        <p>FoodProcessor extracts recipe data from publicly available YouTube videos. We do not claim ownership of the original video content. Extracted recipes are provided for your personal, non-commercial use.</p>
        <p>The app itself, including its design, code, AI models, and branding, is the intellectual property of FoodProcessor and is protected by applicable laws.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">6. AI Accuracy Disclaimer</h2>
        <p>Recipe extraction is performed by artificial intelligence and may not always be 100% accurate. We recommend reviewing extracted ingredients and instructions before cooking. FoodProcessor is not responsible for errors in AI-generated content, including incorrect quantities, missing ingredients, or inaccurate instructions.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">7. Limitation of Liability</h2>
        <p>FoodProcessor is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of the app, including but not limited to dietary reactions, food safety issues, or reliance on AI-extracted content.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">8. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the updated terms.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">9. Termination</h2>
        <p>We reserve the right to suspend or terminate your access to the app at our discretion, including for violations of these terms or abuse of the service.</p>

        <h2 class="text-xl font-semibold text-text-primary mt-8">10. Contact</h2>
        <p>If you have questions about these Terms of Service, please contact us through the app's support feature.</p>
      </div>
    </div>
  </main>
</template>
