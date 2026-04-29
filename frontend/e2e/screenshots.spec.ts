import { test, expect, type Page, type Locator } from '@playwright/test'
import path from 'node:path'

const SHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots')

async function clearBackend(page: Page): Promise<void> {
  await page.request.post('http://localhost:8081/paint/clearAll').catch(() => {})
}

async function gotoApp(page: Page): Promise<void> {
  await clearBackend(page)
  await page.goto('/')
  await page.waitForSelector('#container')
  await page.waitForTimeout(400)
}

async function pickTool(page: Page, title: string): Promise<void> {
  await page.locator(`button[title="${title}"]`).click()
}

async function clickCanvasAt(page: Page, canvas: Locator, x: number, y: number): Promise<void> {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas not found')
  await page.mouse.click(box.x + x, box.y + y)
}

async function setColorViaPicker(page: Page, sat: number, val: number, hue: number): Promise<void> {
  // hue slider uses an <input type="range"> — find it inside the color panel
  const slider = page.locator('input[type="range"]')
  await slider.evaluate((el: HTMLInputElement, h: number) => {
    el.value = String(h)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, hue)

  const gradient = page.locator('.gradient-box')
  const box = await gradient.boundingBox()
  if (!box) throw new Error('gradient-box not found')
  const x = box.x + sat * box.width
  const y = box.y + (1 - val) * box.height
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(80)
}

test.describe('paint app screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page)
  })

  test('01 empty canvas', async ({ page }) => {
    await page.screenshot({ path: path.join(SHOTS_DIR, '01-empty-canvas.png'), fullPage: false })
  })

  test('02 shape tool active', async ({ page }) => {
    await pickTool(page, 'Square')
    await page.waitForTimeout(150)
    await page.screenshot({ path: path.join(SHOTS_DIR, '02-shape-tool-active.png'), fullPage: false })
  })

  test('03 color picker', async ({ page }) => {
    await setColorViaPicker(page, 0.85, 0.9, 200)
    await page.waitForTimeout(150)
    await page.screenshot({ path: path.join(SHOTS_DIR, '03-color-picker.png'), fullPage: false })
  })

  test('04 shapes showcase', async ({ page }) => {
    const canvas = page.locator('#container')

    // a colourful little gallery
    const items: Array<{ tool: string; x: number; y: number; hue: number; sat: number; val: number }> = [
      { tool: 'Square',    x: 150, y: 170, hue:   0, sat: 0.85, val: 0.95 }, // red
      { tool: 'Rectangle', x: 360, y: 170, hue:  35, sat: 0.85, val: 0.95 }, // orange
      { tool: 'Circle',    x: 540, y: 170, hue:  60, sat: 0.85, val: 0.95 }, // yellow
      { tool: 'Ellipse',   x: 720, y: 170, hue: 140, sat: 0.85, val: 0.85 }, // green
      { tool: 'Triangle',  x: 180, y: 410, hue: 200, sat: 0.85, val: 0.95 }, // cyan-blue
      { tool: 'Pentagon',  x: 380, y: 410, hue: 240, sat: 0.85, val: 0.95 }, // blue
      { tool: 'Hexagon',   x: 560, y: 410, hue: 280, sat: 0.85, val: 0.95 }, // purple
      { tool: 'Line',      x: 720, y: 410, hue: 320, sat: 0.85, val: 0.95 }, // pink
    ]

    for (const it of items) {
      await setColorViaPicker(page, it.sat, it.val, it.hue)
      await pickTool(page, it.tool)
      await clickCanvasAt(page, canvas,it.x, it.y)
      await page.waitForTimeout(120)
    }

    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SHOTS_DIR, '04-shapes-showcase.png'), fullPage: false })
  })

  test('05 brush stroke', async ({ page }) => {
    const canvas = page.locator('#container')
    const box = await canvas.boundingBox()
    if (!box) throw new Error('canvas not found')

    await setColorViaPicker(page, 0.9, 0.95, 165)
    await pickTool(page, 'Brush')

    const path1: Array<[number, number]> = []
    const cx = box.x + 250
    const cy = box.y + 320
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      path1.push([cx + t * 500, cy + Math.sin(t * Math.PI * 3) * 80])
    }

    await page.mouse.move(path1[0][0], path1[0][1])
    await page.mouse.down()
    for (const [x, y] of path1.slice(1)) {
      await page.mouse.move(x, y)
    }
    await page.mouse.up()

    // signature stroke
    await setColorViaPicker(page, 0.9, 0.95, 30)
    await pickTool(page, 'Brush')
    const path2: Array<[number, number]> = [
      [box.x + 280, box.y + 450],
      [box.x + 320, box.y + 470],
      [box.x + 380, box.y + 460],
      [box.x + 440, box.y + 480],
      [box.x + 510, box.y + 470],
      [box.x + 580, box.y + 490],
      [box.x + 640, box.y + 480],
      [box.x + 700, box.y + 460],
    ]
    await page.mouse.move(path2[0][0], path2[0][1])
    await page.mouse.down()
    for (const [x, y] of path2.slice(1)) {
      await page.mouse.move(x, y)
    }
    await page.mouse.up()

    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SHOTS_DIR, '05-brush-stroke.png'), fullPage: false })
  })

  test('06 selection with transformer', async ({ page }) => {
    const canvas = page.locator('#container')

    await setColorViaPicker(page, 0.85, 0.95, 240)
    await pickTool(page, 'Rectangle')
    await clickCanvasAt(page, canvas,500, 320)
    await page.waitForTimeout(150)

    // click again on the rectangle to select it (transformer appears)
    await clickCanvasAt(page, canvas,540, 360)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SHOTS_DIR, '06-selection-transformer.png'), fullPage: false })
  })
})
