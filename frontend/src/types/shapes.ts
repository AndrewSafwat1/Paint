export interface BaseShape {
  id: string
  name: string
  draggable: boolean
  x?: number
  y?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

export interface SquareShape extends BaseShape {
  name: 'square'
  width: number
  height: number
}

export interface RectShape extends BaseShape {
  name: 'rectangle'
  width: number
  height: number
}

export interface CircleShape extends BaseShape {
  name: 'circle'
  radius: number
}

// Intentionally misspelled to match backend
export interface EllipseShape extends BaseShape {
  name: 'elipse'
  radiusX: number
  radiusY: number
}

export interface TriangleShape extends BaseShape {
  name: 'triangle'
  sides: 3
  radius: number
}

export interface PentagonShape extends BaseShape {
  name: 'pentagon'
  sides: 5
  radius: number
}

export interface HexagonShape extends BaseShape {
  name: 'hexagon'
  sides: 6
  radius: number
}

export interface LineShape extends BaseShape {
  name: 'line'
  points: number[]
  lineCap: string
  lineJoin: string
}

export type AnyShape =
  | SquareShape
  | RectShape
  | CircleShape
  | EllipseShape
  | TriangleShape
  | PentagonShape
  | HexagonShape
  | LineShape
