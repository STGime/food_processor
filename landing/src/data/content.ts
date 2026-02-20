export const nav = {
  links: [
    { label: 'Features', href: '#benefits' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Blog', href: '#blog' },
    { label: 'FAQ', href: '#faq' },
  ],
}

export const hero = {
  headline: 'Turn Any Cooking Video Into a Recipe',
  subheadline: 'Paste a YouTube link. Our AI extracts every ingredient, builds your shopping list and recipe card, and gives you step-by-step instructions — in seconds.',
  primaryCta: 'Download for iOS',
  secondaryCta: 'Learn More',
  appStoreUrl: '#',
}

export const benefits = {
  headline: 'Everything You Need to Go From Video to Kitchen',
  description: 'FoodProcessor uses AI to turn cooking videos into actionable recipe cards — no more pausing and rewinding.',
  features: [
    {
      icon: '🔗',
      title: 'Paste Any YouTube URL',
      description: 'Just copy a link from your favorite cooking channel. We support any YouTube video with spoken or visible recipes.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Extraction',
      description: 'Our AI watches the video for you — identifying every ingredient, quantity, and measurement with high accuracy.',
    },
    {
      icon: '🛒',
      title: 'Instant Shopping Lists',
      description: 'Ingredients are automatically organized into a clean shopping list you can check off at the store.',
    },
    {
      icon: '🔄',
      title: 'Smart Ingredient Swaps',
      description: 'Out of an ingredient? Get instant AI-powered substitution suggestions that keep the recipe on track.',
    },
    {
      icon: '👨‍🍳',
      title: 'Step-by-Step Instructions',
      description: 'Full cooking instructions extracted and organized into clear, numbered steps you can follow in the kitchen.',
    },
    {
      icon: '📋',
      title: 'Beautiful Recipe Cards',
      description: 'Every recipe is saved as a card with ingredients, instructions, and source video — your personal cookbook.',
    },
  ],
}

export const howItWorks = {
  headline: 'Three Steps to Dinner',
  description: 'From video to table in under a minute.',
  steps: [
    {
      step: '1',
      title: 'Paste a Link',
      description: 'Copy any YouTube cooking video URL and paste it into FoodProcessor. That\'s all you need to do.',
    },
    {
      step: '2',
      title: 'AI Does the Work',
      description: 'Our AI analyzes the video, extracts every ingredient with quantities, and generates step-by-step cooking instructions.',
    },
    {
      step: '3',
      title: 'Shop & Cook',
      description: 'Use your instant shopping list at the grocery store, then follow the recipe card in your kitchen. Done.',
    },
  ],
}

export const showcase = {
  headline: 'Real Recipes, Extracted in Seconds',
  description: 'See what FoodProcessor creates from actual cooking videos.',
  recipes: [
    {
      title: 'Homemade Margherita Pizza',
      source: 'Cooking video',
      ingredients: ['Pizza dough', 'San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Olive oil', 'Sea salt'],
      color: '#EF4444',
    },
    {
      title: 'Thai Green Curry',
      source: 'Cooking video',
      ingredients: ['Coconut milk', 'Green curry paste', 'Chicken thighs', 'Thai basil', 'Fish sauce', 'Palm sugar'],
      color: '#22C55E',
    },
    {
      title: 'Chocolate Lava Cake',
      source: 'Cooking video',
      ingredients: ['Dark chocolate', 'Unsalted butter', 'Eggs', 'Sugar', 'All-purpose flour', 'Vanilla extract'],
      color: '#92400E',
    },
  ],
}

export const blog = {
  headline: 'Recipes & Cooking Tips',
  description: 'Fresh ideas, smart techniques, and recipes worth making.',
  posts: [
    {
      slug: 'five-minute-weeknight-pasta',
      title: '5 Weeknight Pastas You Can Make in Under 20 Minutes',
      excerpt: 'Quick doesn\'t mean boring. These five pasta recipes use pantry staples and come together faster than delivery.',
      category: 'Recipes',
      date: '2026-02-18',
      readTime: '4 min read',
      image: '🍝',
    },
    {
      slug: 'knife-skills-basics',
      title: 'Knife Skills 101: The Only 3 Cuts You Actually Need',
      excerpt: 'Forget fancy culinary school techniques. Master these three cuts and you\'ll handle 90% of home cooking prep.',
      category: 'Cooking Tips',
      date: '2026-02-14',
      readTime: '5 min read',
      image: '🔪',
    },
    {
      slug: 'ingredient-swaps-baking',
      title: 'The Ultimate Baking Substitution Guide',
      excerpt: 'Out of eggs? No buttermilk? Here are tested swaps that actually work — plus the science behind why.',
      category: 'Cooking Tips',
      date: '2026-02-10',
      readTime: '6 min read',
      image: '🧁',
    },
    {
      slug: 'meal-prep-curry',
      title: 'One Curry Base, Five Different Meals',
      excerpt: 'Make a big batch of this versatile curry base on Sunday and transform it into five completely different dinners.',
      category: 'Meal Prep',
      date: '2026-02-06',
      readTime: '7 min read',
      image: '🍛',
    },
    {
      slug: 'season-cast-iron',
      title: 'How to Season a Cast Iron Pan (And Why Everyone Overcomplicates It)',
      excerpt: 'It\'s simpler than the internet makes it. Here\'s the no-nonsense guide to a perfectly seasoned skillet.',
      category: 'Cooking Tips',
      date: '2026-02-02',
      readTime: '3 min read',
      image: '🍳',
    },
    {
      slug: 'homemade-pizza-dough',
      title: 'The Only Pizza Dough Recipe You\'ll Ever Need',
      excerpt: 'Crispy outside, chewy inside. This no-knead overnight dough takes 5 minutes of hands-on time.',
      category: 'Recipes',
      date: '2026-01-28',
      readTime: '5 min read',
      image: '🍕',
    },
  ],
}

export const faq = {
  headline: 'Frequently Asked Questions',
  description: 'Everything you need to know about FoodProcessor.',
  items: [
    {
      question: 'What types of cooking videos work?',
      answer: 'FoodProcessor works with any YouTube cooking video where ingredients are mentioned verbally or shown on screen. It supports videos in English and works best with recipe-focused content from cooking channels.',
    },
    {
      question: 'How accurate is the ingredient extraction?',
      answer: 'Our AI achieves high accuracy for most cooking videos. It captures ingredient names, quantities, and measurements. For complex or fast-paced videos, we recommend reviewing the extracted list — you can always edit ingredients manually.',
    },
    {
      question: 'Is FoodProcessor free?',
      answer: 'FoodProcessor is free to download with basic features. Premium features like unlimited ingredient extraction, AI-powered swaps, and full cooking instructions are available via an in-app subscription through the App Store.',
    },
    {
      question: 'How do ingredient swaps work?',
      answer: 'Tap any ingredient in your recipe to get AI-suggested substitutions. Whether you\'re out of an ingredient, have dietary restrictions, or want a healthier option — the AI suggests alternatives that work for the recipe.',
    },
    {
      question: 'Does the app work offline?',
      answer: 'Saved recipe cards and shopping lists are available offline. However, extracting a new recipe from a YouTube video requires an internet connection for AI processing.',
    },
    {
      question: 'What platforms is FoodProcessor available on?',
      answer: 'FoodProcessor is currently available on iOS. Android support is planned for a future release.',
    },
  ],
}

export const cta = {
  headline: 'Stop Pausing Videos. Start Cooking.',
  description: 'Download FoodProcessor and turn your favorite cooking videos into actionable recipes in seconds.',
  primaryCta: 'Download for iOS',
  appStoreUrl: '#',
}

export const footer = {
  brand: {
    name: 'FoodProcessor',
    tagline: 'Turn cooking videos into recipes with AI.',
  },
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#benefits' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Blog', href: '#blog' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ],
}
