import { describe, it, expect } from 'vitest'
import { buildShapeFromClick } from '../buildShapeFromClick'

const CX = 200
const CY = 150
const COLOR = '#ff0000'
const ID = '42'

describe('buildShapeFromClick', () => {
  it('shapeVariable 1 → square centered on click with 100×100 dimensions', () => {
    const s = buildShapeFromClick(1, CX, CY, COLOR, ID)!
    expect(s.name).toBe('square')
    expect(s.id).toBe(ID)
    expect((s as any).width).toBe(100)
    expect((s as any).height).toBe(100)
    expect(s.x).toBe(CX - 50)
    expect(s.y).toBe(CY - 50)
    expect(s.fill).toBe(COLOR)
  })

  it('shapeVariable 2 → rectangle wider than tall', () => {
    const s = buildShapeFromClick(2, CX, CY, COLOR, ID)!
    expect(s.name).toBe('rectangle')
    expect((s as any).width).toBe(200)
    expect((s as any).height).toBe(100)
  })

  it('shapeVariable 3 → ellipse with radiusX > radiusY', () => {
    const s = buildShapeFromClick(3, CX, CY, COLOR, ID)!
    expect(s.name).toBe('ellipse')
    expect((s as any).radiusX).toBe(100)
    expect((s as any).radiusY).toBe(50)
    expect(s.x).toBe(CX)
    expect(s.y).toBe(CY)
  })

  it('shapeVariable 4 → triangle with sides 3', () => {
    const s = buildShapeFromClick(4, CX, CY, COLOR, ID)!
    expect(s.name).toBe('triangle')
    expect((s as any).sides).toBe(3)
    expect((s as any).radius).toBe(100)
  })

  it('shapeVariable 5 → circle', () => {
    const s = buildShapeFromClick(5, CX, CY, COLOR, ID)!
    expect(s.name).toBe('circle')
    expect((s as any).radius).toBe(60)
  })

  it('shapeVariable 6 → line with 4 points centred on click', () => {
    const s = buildShapeFromClick(6, CX, CY, COLOR, ID)!
    expect(s.name).toBe('line')
    expect((s as any).points).toEqual([CX - 100, CY - 100, CX + 100, CY + 100])
    expect(s.stroke).toBe(COLOR)
  })

  it('shapeVariable 7 → pentagon with sides 5', () => {
    const s = buildShapeFromClick(7, CX, CY, COLOR, ID)!
    expect(s.name).toBe('pentagon')
    expect((s as any).sides).toBe(5)
    expect((s as any).radius).toBe(70)
  })

  it('shapeVariable 8 → hexagon with sides 6', () => {
    const s = buildShapeFromClick(8, CX, CY, COLOR, ID)!
    expect(s.name).toBe('hexagon')
    expect((s as any).sides).toBe(6)
  })

  it('shapeVariable 9 (brush) → null', () => {
    expect(buildShapeFromClick(9, CX, CY, COLOR, ID)).toBeNull()
  })

  it('shapeVariable 0 (no tool) → null', () => {
    expect(buildShapeFromClick(0, CX, CY, COLOR, ID)).toBeNull()
  })

  it('unknown shapeVariable → null', () => {
    expect(buildShapeFromClick(99, CX, CY, COLOR, ID)).toBeNull()
  })

  it('all non-line shapes use fill from color arg', () => {
    for (const n of [1, 2, 3, 4, 5, 7, 8]) {
      const s = buildShapeFromClick(n, CX, CY, '#abcdef', ID)!
      expect(s.fill).toBe('#abcdef')
    }
  })

  it('all shapes have draggable: true', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const s = buildShapeFromClick(n, CX, CY, COLOR, ID)!
      expect(s.draggable).toBe(true)
    }
  })
})
