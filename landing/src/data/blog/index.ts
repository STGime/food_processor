import fiveMinuteWeekightPasta from './five-minute-weeknight-pasta.md?raw'
import knifeSkillsBasics from './knife-skills-basics.md?raw'
import ingredientSwapsBaking from './ingredient-swaps-baking.md?raw'
import mealPrepCurry from './meal-prep-curry.md?raw'
import seasonCastIron from './season-cast-iron.md?raw'
import homemadePizzaDough from './homemade-pizza-dough.md?raw'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'five-minute-weeknight-pasta',
    title: '5 Weeknight Pastas You Can Make in Under 20 Minutes',
    excerpt: 'Quick doesn\'t mean boring. These five pasta recipes use pantry staples and come together faster than delivery.',
    category: 'Recipes',
    date: '2026-02-18',
    readTime: '4 min read',
    image: '🍝',
    content: fiveMinuteWeekightPasta,
  },
  {
    slug: 'knife-skills-basics',
    title: 'Knife Skills 101: The Only 3 Cuts You Actually Need',
    excerpt: 'Forget fancy culinary school techniques. Master these three cuts and you\'ll handle 90% of home cooking prep.',
    category: 'Cooking Tips',
    date: '2026-02-14',
    readTime: '5 min read',
    image: '🔪',
    content: knifeSkillsBasics,
  },
  {
    slug: 'ingredient-swaps-baking',
    title: 'The Ultimate Baking Substitution Guide',
    excerpt: 'Out of eggs? No buttermilk? Here are tested swaps that actually work — plus the science behind why.',
    category: 'Cooking Tips',
    date: '2026-02-10',
    readTime: '6 min read',
    image: '🧁',
    content: ingredientSwapsBaking,
  },
  {
    slug: 'meal-prep-curry',
    title: 'One Curry Base, Five Different Meals',
    excerpt: 'Make a big batch of this versatile curry base on Sunday and transform it into five completely different dinners.',
    category: 'Meal Prep',
    date: '2026-02-06',
    readTime: '7 min read',
    image: '🍛',
    content: mealPrepCurry,
  },
  {
    slug: 'season-cast-iron',
    title: 'How to Season a Cast Iron Pan (And Why Everyone Overcomplicates It)',
    excerpt: 'It\'s simpler than the internet makes it. Here\'s the no-nonsense guide to a perfectly seasoned skillet.',
    category: 'Cooking Tips',
    date: '2026-02-02',
    readTime: '3 min read',
    image: '🍳',
    content: seasonCastIron,
  },
  {
    slug: 'homemade-pizza-dough',
    title: 'The Only Pizza Dough Recipe You\'ll Ever Need',
    excerpt: 'Crispy outside, chewy inside. This no-knead overnight dough takes 5 minutes of hands-on time.',
    category: 'Recipes',
    date: '2026-01-28',
    readTime: '5 min read',
    image: '🍕',
    content: homemadePizzaDough,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}
