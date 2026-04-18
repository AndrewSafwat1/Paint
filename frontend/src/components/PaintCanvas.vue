<script setup lang="ts">
import { inject, ref, shallowRef, reactive, watch, onMounted, onUnmounted } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'
import { paintApi } from '../services/paintApi'
import type { AnyShape, LineShape } from '../types/shapes'

const state = inject(ShapeStateKey)!
const {
  rectangles,
  circles,
  ellipses,
  triangles,
  pentagons,
  hexagons,
  lines,
  allshapes,
  shapeVariable,
  selectedShapeId,
  deleteFlag,
  copyFlag,
  colorFlag,
  activeColor,
} = state

const stageConfig = reactive({ width: 1000, height: 600 })

const transformerRef = ref<any>(null)

const mouseDown = shallowRef(false)
const initial = shallowRef(true)
const usingBrush = shallowRef(false)
const brushLineId = shallowRef('')
const arrayOfPts = ref<number[]>([])
const oldX = shallowRef(0)
const oldY = shallowRef(0)

function getCanvasOffset(): { offsetWidth: number; offsetHeight: number } {
  const container = document.getElementById('container')
  if (!container) return { offsetWidth: 0, offsetHeight: 0 }
  const rect = container.getBoundingClientRect()
  return { offsetWidth: rect.left, offsetHeight: rect.top }
}

function fitStageIntoParentContainer(): void {
  const container = document.getElementById('container')
  if (!container) return
  const style = window.getComputedStyle(container)
  stageConfig.width = parseInt(style.width)
  stageConfig.height = parseInt(style.height)
}

watch(
  selectedShapeId,
  (id) => {
    const transformerNode = transformerRef.value?.getNode()
    if (!transformerNode) return
    if (!id) {
      transformerNode.nodes([])
      return
    }
    const stage = transformerNode.getStage()
    const selectedNode = stage.findOne('#' + id)
    if (selectedNode) {
      transformerNode.nodes([selectedNode])
    } else {
      transformerNode.nodes([])
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  window.addEventListener('resize', fitStageIntoParentContainer)
  fitStageIntoParentContainer()
})

onUnmounted(() => {
  window.removeEventListener('resize', fitStageIntoParentContainer)
})

function handleMouseUp(): void {
  mouseDown.value = false
  initial.value = true

  if (usingBrush.value) {
    usingBrush.value = false
    const finalLine: LineShape = {
      points: arrayOfPts.value,
      stroke: activeColor.value,
      strokeWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      name: 'line',
      id: brushLineId.value,
    }
    arrayOfPts.value = []
    state.finalizeBrushLine(brushLineId.value, finalLine)
    paintApi.createShape(finalLine).catch(err => console.error('Error:', err))
  }
}

function handleMouseMove(e: any): void {
  const { offsetWidth, offsetHeight } = getCanvasOffset()
  const clientX: number = e.evt.clientX
  const clientY: number = e.evt.clientY

  if (mouseDown.value && initial.value && shapeVariable.value === 9) {
    initial.value = false
    usingBrush.value = true
    brushLineId.value = state.nextId()
    arrayOfPts.value.push(clientX - offsetWidth, clientY - offsetHeight)

    state.addBrushSegment({
      points: [clientX - offsetWidth, clientY - offsetHeight,
               clientX - offsetWidth, clientY - offsetHeight],
      stroke: activeColor.value,
      strokeWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      name: 'line',
      id: brushLineId.value,
    })
    oldX.value = clientX
    oldY.value = clientY
  } else if (mouseDown.value && shapeVariable.value === 9) {
    arrayOfPts.value.push(clientX - offsetWidth, clientY - offsetHeight)

    state.addBrushSegment({
      points: [oldX.value - offsetWidth, oldY.value - offsetHeight,
               clientX - offsetWidth, clientY - offsetHeight],
      stroke: activeColor.value,
      strokeWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      name: 'line',
      id: brushLineId.value,
    })
    oldX.value = clientX
    oldY.value = clientY
  }
}

async function handleStageMouseDown(e: any): Promise<void> {
  if (e.target === e.target.getStage()) {
    mouseDown.value = true
    state.resetFlags()
    state.setSelectedShapeId('')
    return
  }

  const clickedOnTransformer = e.target.getParent().className === 'Transformer'
  if (clickedOnTransformer) {
    mouseDown.value = false
    state.resetFlags()
    return
  }

  const id: string = e.target.id()
  const shape = allshapes.value.find(r => r.id === id)
  mouseDown.value = false

  if (!shape) {
    state.setSelectedShapeId('')
    return
  }

  if (deleteFlag.value) {
    const shapes = await paintApi.removeShape(id).catch(err => {
      console.error('Error:', err)
      return allshapes.value as AnyShape[]
    })
    state.setAllShapes(shapes)
    state.setDeleteFlag(false)
    state.setSelectedShapeId('')
    return
  }

  if (copyFlag.value) {
    const newId = state.nextId()
    const clonedShape = await paintApi.cloneShape(id, newId, shape).catch(err => {
      console.error('Error:', err)
      return null
    })
    if (clonedShape) state.addShape(clonedShape)
    state.setCopyFlag(false)
    state.setSelectedShapeId('')
    return
  }

  if (colorFlag.value) {
    const color = activeColor.value
    const updates: Partial<AnyShape> = shape.name === 'line' ? { stroke: color } : { fill: color }
    state.updateShape(id, updates)
    const updatedShape = allshapes.value.find(s => s.id === id)
    if (updatedShape) {
      await paintApi.updateShape(updatedShape).catch(err => console.error('Error:', err))
    }
    state.setColorFlag(false)
    state.setSelectedShapeId('')
    return
  }

  state.setSelectedShapeId(id)
}

async function handleDragEnd(e: any): Promise<void> {
  const id: string = e.target.id()
  state.updateShape(id, { x: e.target.x(), y: e.target.y() })
  const shape = allshapes.value.find(s => s.id === id)
  if (shape) {
    await paintApi.updateShape(shape).catch(err => console.error('Error:', err))
  }
}

async function handleTransformEnd(e: any): Promise<void> {
  const id = selectedShapeId.value
  if (!id) return
  state.updateShape(id, {
    x: e.target.x(),
    y: e.target.y(),
    rotation: e.target.rotation(),
    scaleX: e.target.scaleX(),
    scaleY: e.target.scaleY(),
  })
  const shape = allshapes.value.find(s => s.id === id)
  if (shape) {
    await paintApi.updateShape(shape).catch(err => console.error('Error:', err))
  }
}

function createElement(event: MouseEvent): void {
  if (shapeVariable.value === 9) return
  state.resetFlags()

  const { offsetWidth, offsetHeight } = getCanvasOffset()
  const cx = event.clientX - offsetWidth
  const cy = event.clientY - offsetHeight
  const color = activeColor.value
  const id = state.nextId()

  let shape: AnyShape | null = null

  switch (shapeVariable.value) {
    case 1:
      shape = { x: cx - 50, y: cy - 50, width: 100, height: 100, fill: color, stroke: 'black', strokeWidth: 3, draggable: true, name: 'square', scaleX: 1, scaleY: 1, id }
      break
    case 2:
      shape = { x: cx - 100, y: cy - 50, width: 200, height: 100, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'rectangle', id }
      break
    case 3:
      shape = { x: cx, y: cy, radiusX: 100, radiusY: 50, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'elipse', id }
      break
    case 4:
      shape = { x: cx, y: cy, sides: 3, radius: 100, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'triangle', id }
      break
    case 5:
      shape = { x: cx, y: cy, radius: 60, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'circle', id }
      break
    case 6:
      shape = { points: [cx - 100, cy - 100, cx + 100, cy + 100], stroke: color, strokeWidth: 10, lineCap: 'round', lineJoin: 'round', draggable: true, name: 'line', id }
      break
    case 7:
      shape = { x: cx, y: cy, sides: 5, radius: 70, fill: color, stroke: 'black', draggable: true, strokeWidth: 3, name: 'pentagon', id }
      break
    case 8:
      shape = { x: cx, y: cy, sides: 6, radius: 70, fill: color, stroke: 'black', strokeWidth: 3, draggable: true, name: 'hexagon', id }
      break
  }

  if (shape) {
    state.addShape(shape)
    paintApi.createShape(shape).catch(err => console.error('Error:', err))
  }

  state.setShapeVariable(0)
}
</script>

<template>
  <section>
    <div
      id="container"
      @click="createElement"
    >
      <v-stage
        :config="stageConfig"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        <v-layer>
          <v-circle
            v-for="shapeConfig in circles"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @dragend="handleDragEnd"
            @transformend="handleTransformEnd"
          />
          <v-rect
            v-for="shapeConfig in rectangles"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-ellipse
            v-for="shapeConfig in ellipses"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-line
            v-for="shapeConfig in lines"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-regular-polygon
            v-for="shapeConfig in triangles"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-regular-polygon
            v-for="shapeConfig in pentagons"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-regular-polygon
            v-for="shapeConfig in hexagons"
            :key="shapeConfig.id"
            :config="shapeConfig"
            @transformend="handleTransformEnd"
            @dragend="handleDragEnd"
          />
          <v-transformer ref="transformerRef" />
        </v-layer>
      </v-stage>
    </div>
  </section>
</template>
