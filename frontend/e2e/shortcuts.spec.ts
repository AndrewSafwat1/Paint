import { test, expect, type Page, type Locator } from '@playwright/test'

async function clearBackend(page: Page): Promise<void> {
  await page.request.post('http://localhost:8081/paint/clearAll').catch(() => {})
}

async function gotoApp(page: Page): Promise<void> {
  await clearBackend(page)
  await page.goto('/')
  await page.waitForSelector('#container')
  await page.waitForTimeout(300)
}

async function clickCanvasAt(page: Page, canvas: Locator, x: number, y: number): Promise<void> {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas not found')
  await page.mouse.click(box.x + x, box.y + y)
}

async function shapesOnServer(page: Page): Promise<Array<Record<string, unknown>>> {
  const res = await page.request.post(
    'http://localhost:8081/paint/saveContent?format=json&idCounter=0',
  )
  const body = await res.text()
  const parsed = JSON.parse(body) as { lastUpdate?: Array<Record<string, unknown>> }
  return parsed.lastUpdate ?? []
}

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => { await gotoApp(page) })

  test('Delete removes the selected shape', async ({ page }) => {
    const canvas = page.locator('#container')

    await page.locator('button[title="Square"]').click()
    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(200)

    // click the shape to select it
    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(150)

    await page.keyboard.press('Delete')
    await page.waitForTimeout(300)

    const shapes = await shapesOnServer(page)
    expect(shapes).toHaveLength(0)
  })

  test('Ctrl+C duplicates the selected shape with offset', async ({ page }) => {
    const canvas = page.locator('#container')

    await page.locator('button[title="Circle"]').click()
    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(200)

    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(150)

    await page.keyboard.press('Control+c')
    await page.waitForTimeout(400)

    const shapes = await shapesOnServer(page) as Array<{ name: string; x: number; y: number }>
    expect(shapes).toHaveLength(2)
    const xs = shapes.map(s => s.x).sort((a, b) => a - b)
    const ys = shapes.map(s => s.y).sort((a, b) => a - b)
    expect(xs[1] - xs[0]).toBe(20)
    expect(ys[1] - ys[0]).toBe(20)
  })

  test('Ctrl+Z undoes the last action', async ({ page }) => {
    const canvas = page.locator('#container')

    await page.locator('button[title="Square"]').click()
    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)

    const shapes = await shapesOnServer(page)
    expect(shapes).toHaveLength(0)
  })

  test('Ctrl+Y redoes after undo', async ({ page }) => {
    const canvas = page.locator('#container')

    await page.locator('button[title="Triangle"]').click()
    await clickCanvasAt(page, canvas, 400, 300)
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+z')
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+y')
    await page.waitForTimeout(300)

    const shapes = await shapesOnServer(page)
    expect(shapes).toHaveLength(1)
  })
})
