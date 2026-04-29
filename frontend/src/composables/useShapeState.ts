import { ref, shallowRef } from 'vue'
import type {
  AnyShape,
  SquareShape,
  RectShape,
  CircleShape,
  EllipseShape,
  TriangleShape,
  PentagonShape,
  HexagonShape,
  LineShape,
} from '../types/shapes'

export type ShapeState = ReturnType<typeof useShapeState>

export function useShapeState() {
  const rectangles = ref<(SquareShape | RectShape)[]>([])
  const circles = ref<CircleShape[]>([])
  const ellipses = ref<EllipseShape[]>([])
  const triangles = ref<TriangleShape[]>([])
  const pentagons = ref<PentagonShape[]>([])
  const hexagons = ref<HexagonShape[]>([])
  const lines = ref<LineShape[]>([])
  const allshapes = ref<AnyShape[]>([])

  const id = shallowRef(0)
  const shapeVariable = shallowRef(0)
  const selectedShapeId = shallowRef('')
  const deleteFlag = shallowRef(false)
  const copyFlag = shallowRef(false)
  const colorFlag = shallowRef(false)
  const activeColor = shallowRef('#ededed')

  function dispatchToTypedArray(shape: AnyShape): void {
    switch (shape.name) {
      case 'square':
      case 'rectangle':
        rectangles.value.push(shape)
        break
      case 'circle':
        circles.value.push(shape as CircleShape)
        break
      case 'ellipse':
        ellipses.value.push(shape as EllipseShape)
        break
      case 'triangle':
        triangles.value.push(shape as TriangleShape)
        break
      case 'pentagon':
        pentagons.value.push(shape as PentagonShape)
        break
      case 'hexagon':
        hexagons.value.push(shape as HexagonShape)
        break
      case 'line':
        lines.value.push(shape as LineShape)
        break
    }
  }

  function populateFromAllShapes(): void {
    rectangles.value = []
    circles.value = []
    ellipses.value = []
    triangles.value = []
    pentagons.value = []
    hexagons.value = []
    lines.value = []
    for (const shape of allshapes.value) {
      dispatchToTypedArray(shape)
    }
  }

  function nextId(): string {
    const current = String(id.value)
    id.value++
    return current
  }

  function addShape(shape: AnyShape): void {
    allshapes.value.push(shape)
    dispatchToTypedArray(shape)
  }

  function addBrushSegment(line: LineShape): void {
    lines.value.push(line)
  }

  function finalizeBrushLine(lineId: string, finalLine: LineShape): void {
    const idx = lines.value.findIndex(l => l.id === lineId)
    if (idx !== -1) {
      lines.value = lines.value.slice(0, idx)
    }
    lines.value.push(finalLine)
    allshapes.value.push(finalLine)
  }

  function setAllShapes(shapes: AnyShape[]): void {
    allshapes.value = shapes
    populateFromAllShapes()
  }

  function clearAll(): void {
    allshapes.value = []
    rectangles.value = []
    circles.value = []
    ellipses.value = []
    triangles.value = []
    pentagons.value = []
    hexagons.value = []
    lines.value = []
  }

  function updateShape(shapeId: string, updates: Partial<AnyShape>): void {
    const allItem = allshapes.value.find(s => s.id === shapeId)
    if (!allItem) return
    Object.assign(allItem, updates)

    const typedItem = getTypedArrayByName(allItem.name)?.find(s => s.id === shapeId)
    if (typedItem) Object.assign(typedItem, updates)
  }

  function getTypedArrayByName(name: string): AnyShape[] | null {
    switch (name) {
      case 'square':
      case 'rectangle': return rectangles.value as AnyShape[]
      case 'circle': return circles.value as AnyShape[]
      case 'ellipse': return ellipses.value as AnyShape[]
      case 'triangle': return triangles.value as AnyShape[]
      case 'pentagon': return pentagons.value as AnyShape[]
      case 'hexagon': return hexagons.value as AnyShape[]
      case 'line': return lines.value as AnyShape[]
      default: return null
    }
  }

  function resetFlags(): void {
    deleteFlag.value = false
    copyFlag.value = false
    colorFlag.value = false
  }

  function setId(n: number): void { id.value = n }
  function setShapeVariable(n: number): void { shapeVariable.value = n }
  function setSelectedShapeId(shapeId: string): void { selectedShapeId.value = shapeId }
  function setDeleteFlag(v: boolean): void { deleteFlag.value = v }
  function setCopyFlag(v: boolean): void { copyFlag.value = v }
  function setColorFlag(v: boolean): void { colorFlag.value = v }
  function setActiveColor(color: string): void { activeColor.value = color }

  return {
    rectangles,
    circles,
    ellipses,
    triangles,
    pentagons,
    hexagons,
    lines,
    allshapes,
    id,
    shapeVariable,
    selectedShapeId,
    deleteFlag,
    copyFlag,
    colorFlag,
    activeColor,
    nextId,
    addShape,
    addBrushSegment,
    finalizeBrushLine,
    setAllShapes,
    clearAll,
    updateShape,
    resetFlags,
    setId,
    setShapeVariable,
    setSelectedShapeId,
    setDeleteFlag,
    setCopyFlag,
    setColorFlag,
    setActiveColor,
  }
}
