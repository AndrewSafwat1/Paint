import { describe, it, expect, beforeEach } from 'vitest'
import { useShapeState } from '../useShapeState'
import type { CircleShape, SquareShape, LineShape } from '../../types/shapes'

const circle = (): CircleShape => ({
  id: 'c1', name: 'circle', radius: 60, fill: '#fff', stroke: 'black',
  strokeWidth: 3, draggable: true,
})

const square = (): SquareShape => ({
  id: 's1', name: 'square', width: 100, height: 100, fill: '#fff',
  stroke: 'black', strokeWidth: 3, draggable: true, scaleX: 1, scaleY: 1,
})

const line = (): LineShape => ({
  id: 'l1', name: 'line', points: [0, 0, 100, 100], stroke: '#000',
  strokeWidth: 10, lineCap: 'round', lineJoin: 'round', draggable: true,
})

describe('useShapeState', () => {
  let state: ReturnType<typeof useShapeState>

  beforeEach(() => {
    state = useShapeState()
  })

  // ── addShape / dispatchToTypedArray ───────────────────────────────────────

  it('routes circle to circles array only', () => {
    state.addShape(circle())
    expect(state.circles.value).toHaveLength(1)
    expect(state.rectangles.value).toHaveLength(0)
    expect(state.lines.value).toHaveLength(0)
    expect(state.allshapes.value).toHaveLength(1)
  })

  it('routes square and rectangle both to rectangles array', () => {
    state.addShape(square())
    state.addShape({ ...square(), id: 'r1', name: 'rectangle', width: 200, height: 100 })
    expect(state.rectangles.value).toHaveLength(2)
    expect(state.circles.value).toHaveLength(0)
  })

  it('routes ellipse to ellipses array', () => {
    state.addShape({ id: 'e1', name: 'ellipse', radiusX: 100, radiusY: 50, fill: '#fff', stroke: 'black', strokeWidth: 3, draggable: true })
    expect(state.ellipses.value).toHaveLength(1)
    expect(state.circles.value).toHaveLength(0)
  })

  it('routes pentagon to pentagons — not to triangles', () => {
    state.addShape({ id: 'p1', name: 'pentagon', sides: 5, radius: 70, fill: '#fff', stroke: 'black', strokeWidth: 3, draggable: true })
    expect(state.pentagons.value).toHaveLength(1)
    expect(state.triangles.value).toHaveLength(0)
  })

  it('routes hexagon to hexagons', () => {
    state.addShape({ id: 'h1', name: 'hexagon', sides: 6, radius: 70, fill: '#fff', stroke: 'black', strokeWidth: 3, draggable: true })
    expect(state.hexagons.value).toHaveLength(1)
  })

  it('routes line to lines array', () => {
    state.addShape(line())
    expect(state.lines.value).toHaveLength(1)
    expect(state.allshapes.value).toHaveLength(1)
  })

  // ── setAllShapes ──────────────────────────────────────────────────────────

  it('setAllShapes rebuilds all typed arrays from scratch', () => {
    state.addShape(circle())
    state.addShape(square())

    state.setAllShapes([circle(), line()])

    expect(state.allshapes.value).toHaveLength(2)
    expect(state.circles.value).toHaveLength(1)
    expect(state.lines.value).toHaveLength(1)
    expect(state.rectangles.value).toHaveLength(0)
  })

  it('setAllShapes clears all arrays before repopulating', () => {
    state.addShape(circle())
    state.setAllShapes([])

    expect(state.allshapes.value).toHaveLength(0)
    expect(state.circles.value).toHaveLength(0)
  })

  // ── updateShape ───────────────────────────────────────────────────────────

  it('updateShape mutates both allshapes and the typed array', () => {
    state.addShape(circle())
    state.updateShape('c1', { fill: '#ff0000' })

    expect(state.allshapes.value[0].fill).toBe('#ff0000')
    expect(state.circles.value[0].fill).toBe('#ff0000')
    expect(state.circles.value).toHaveLength(1)
  })

  it('updateShape no-ops silently when id is not found', () => {
    expect(() => state.updateShape('nonexistent', { fill: 'red' })).not.toThrow()
    expect(state.allshapes.value).toHaveLength(0)
  })

  it('updateShape on a line mutates stroke', () => {
    state.addShape(line())
    state.updateShape('l1', { stroke: '#abcdef' })
    expect(state.lines.value[0].stroke).toBe('#abcdef')
  })

  // ── nextId ────────────────────────────────────────────────────────────────

  it('nextId returns sequential string ids starting at 0', () => {
    expect(state.nextId()).toBe('0')
    expect(state.nextId()).toBe('1')
    expect(state.nextId()).toBe('2')
  })

  it('setId shifts the nextId sequence', () => {
    state.setId(100)
    expect(state.nextId()).toBe('100')
    expect(state.nextId()).toBe('101')
  })

  // ── clearAll ──────────────────────────────────────────────────────────────

  it('clearAll empties every array', () => {
    state.addShape(circle())
    state.addShape(square())
    state.addShape(line())
    state.clearAll()

    expect(state.allshapes.value).toHaveLength(0)
    expect(state.circles.value).toHaveLength(0)
    expect(state.rectangles.value).toHaveLength(0)
    expect(state.lines.value).toHaveLength(0)
  })

  // ── finalizeBrushLine ─────────────────────────────────────────────────────

  it('finalizeBrushLine replaces preview segments with the final line', () => {
    const seg1: LineShape = { ...line(), id: 'brush1', points: [0, 0, 10, 10] }
    const seg2: LineShape = { ...line(), id: 'brush1', points: [10, 10, 20, 20] }
    state.addBrushSegment(seg1)
    state.addBrushSegment(seg2)

    const final: LineShape = { ...line(), id: 'brush1', points: [0, 0, 10, 10, 20, 20] }
    state.finalizeBrushLine('brush1', final)

    expect(state.lines.value).toHaveLength(1)
    expect(state.lines.value[0].points).toEqual([0, 0, 10, 10, 20, 20])
    expect(state.allshapes.value).toHaveLength(1)
  })

  it('finalizeBrushLine adds to allshapes', () => {
    const final = line()
    state.finalizeBrushLine('l1', final)
    expect(state.allshapes.value).toHaveLength(1)
    expect(state.allshapes.value[0]).toMatchObject(final)
  })

  // ── resetFlags ────────────────────────────────────────────────────────────

  it('resetFlags clears all three flags', () => {
    state.setDeleteFlag(true)
    state.setCopyFlag(true)
    state.setColorFlag(true)
    state.resetFlags()

    expect(state.deleteFlag.value).toBe(false)
    expect(state.copyFlag.value).toBe(false)
    expect(state.colorFlag.value).toBe(false)
  })
})
