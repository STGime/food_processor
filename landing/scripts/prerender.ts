/**
 * Post-build prerender script.
 * Spins up a local preview server, visits each route with Puppeteer,
 * and writes the fully-rendered HTML back to dist/.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { execSync, spawn, type ChildProcess } from 'child_process'

const DIST = resolve(import.meta.dirname, '..', 'dist')
const PORT = 4177

// All routes to prerender (static routes + blog slugs)
const blogSlugs = [
  'five-minute-weeknight-pasta',
  'knife-skills-basics',
  'ingredient-swaps-baking',
  'meal-prep-curry',
  'season-cast-iron',
  'homemade-pizza-dough',
]

const routes = [
  '/',
  '/privacy',
  '/terms',
  '/blog',
  ...blogSlugs.map(s => `/blog/${s}`),
]

async function prerender() {
  // Dynamically import puppeteer
  const puppeteer = await import('puppeteer')

  // Start preview server
  console.log('Starting preview server...')
  const server: ChildProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: resolve(import.meta.dirname, '..'),
    stdio: 'pipe',
  })

  // Wait for server to start
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000)
    server.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes(String(PORT))) {
        clearTimeout(timeout)
        resolve()
      }
    })
    server.stderr?.on('data', (data: Buffer) => {
      const msg = data.toString()
      if (msg.includes('Error')) {
        clearTimeout(timeout)
        reject(new Error(msg))
      }
    })
  })

  console.log(`Preview server running on port ${PORT}`)

  const browser = await puppeteer.launch({ headless: true })

  try {
    for (const route of routes) {
      const page = await browser.newPage()
      const url = `http://localhost:${PORT}${route}`
      console.log(`Rendering: ${route}`)

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

      // Wait a bit for animations/transitions to settle
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)))

      const html = await page.content()

      // Write to dist
      const filePath = route === '/'
        ? resolve(DIST, 'index.html')
        : resolve(DIST, route.slice(1), 'index.html')

      const dir = dirname(filePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      writeFileSync(filePath, html, 'utf-8')
      console.log(`  -> ${filePath.replace(DIST, 'dist')}`)

      await page.close()
    }
  } finally {
    await browser.close()
    server.kill()
  }

  console.log(`\nPrerendered ${routes.length} routes.`)
}

prerender().catch(err => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
