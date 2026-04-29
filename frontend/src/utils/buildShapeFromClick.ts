import type { AnyShape } from '../types/shapes'

export function buildShapeFromClick(
  shapeVariable: number,
  cx: number,
  cy: number,
  color: string,
  id: string,
): AnyShape | null {
  switch (shapeVariable) {
    case 1:
      return { x: cx - 50, y: cy - 50, width: 100, height: 100, fill: color, stroke: 'black', strokeWidth: 3, draggable: true, name: 'square', scaleX: 1, scaleY: 1, id }
    case 2:
      return { x: cx - 100, y: cy - 50, width: 200, height: 100, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'rectangle', id }
    case 3:
      return { x: cx, y: cy, radiusX: 100, radiusY: 50, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'ellipse', id }
    case 4:
      return { x: cx, y: cy, sides: 3, radius: 100, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'triangle', id }
    case 5:
      return { x: cx, y: cy, radius: 60, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'circle', id }
    case 6:
      return { points: [cx - 100, cy - 100, cx + 100, cy + 100], stroke: color, strokeWidth: 10, lineCap: 'round', lineJoin: 'round', draggable: true, name: 'line', id }
    case 7:
      return { x: cx, y: cy, sides: 5, radius: 70, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'pentagon', id }
    case 8:
      return { x: cx, y: cy, sides: 6, radius: 70, fill: color, stroke: 'black', strokeWidth: 3, draggable: true, name: 'hexagon', id }
    default:
      return null
  }
}
