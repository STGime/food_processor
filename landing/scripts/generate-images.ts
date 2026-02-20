import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

config({ path: path.join(import.meta.dirname, '..', '..', '.env') })

const API_KEY = process.env.FIREWORKS_API_KEY
if (!API_KEY) {
  console.error('FIREWORKS_API_KEY not found in .env')
  process.exit(1)
}

const OUTPUT_DIR = path.join(import.meta.dirname, '..', 'src', 'assets', 'images')

const images = [
  {
    name: 'hero-phone-mockup.webp',
    prompt: 'Smartphone showing a clean green and white cooking app interface with a shopping list checklist, fresh ingredients in background, soft natural lighting, minimal modern design, white background, no text, product photography style',
    width: 768,
    height: 1024,
  },
  {
    name: 'recipe-showcase.webp',
    prompt: 'Flat lay photography of fresh colorful cooking ingredients on white marble surface, tomatoes, basil, mozzarella, olive oil, garlic, pasta, vibrant colors, overhead shot, food photography, bright natural lighting, no text',
    width: 1344,
    height: 768,
  },
  {
    name: 'ingredient-grid.webp',
    prompt: 'Neatly organized cooking ingredients in small bowls arranged in a grid pattern on white surface, mise en place style, colorful spices herbs vegetables, overhead food photography, clean minimal aesthetic, no text',
    width: 1344,
    height: 768,
  },
  {
    name: 'shopping-list-demo.webp',
    prompt: 'Person holding smartphone in grocery store produce section, phone screen showing green checkmark shopping list app, fresh vegetables in background, lifestyle photography, warm lighting, no readable text on screen',
    width: 1344,
    height: 768,
  },
  {
    name: 'og-image.webp',
    prompt: 'Modern app marketing banner with fresh cooking ingredients arranged around a smartphone, green and orange color accents, clean white background, professional product photography, social media banner style, no text, 1200x630 aspect ratio',
    width: 1200,
    height: 630,
  },
]

async function generateImage(name: string, prompt: string, width: number, height: number): Promise<void> {
  console.log(`Generating: ${name}...`)

  const response = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'image/jpeg',
    },
    body: JSON.stringify({
      prompt,
      cfg_scale: 7,
      height,
      width,
      steps: 4,
      seed: 42,
      safety_check: false,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`Failed to generate ${name}: ${response.status} ${text}`)
    return
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const outputPath = path.join(OUTPUT_DIR, name)
  fs.writeFileSync(outputPath, buffer)
  console.log(`Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`)
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  for (const img of images) {
    await generateImage(img.name, img.prompt, img.width, img.height)
  }

  console.log('\nDone! Generated all images.')
}

main().catch(console.error)
