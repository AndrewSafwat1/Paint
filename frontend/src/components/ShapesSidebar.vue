<script setup lang="ts">
import { computed, inject } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'
import { paintApi } from '../services/paintApi'

const state = inject(ShapeStateKey)!
const { shapeVariable, deleteFlag, copyFlag, colorFlag } = state

const activeTool = computed(() => {
  if (shapeVariable.value === 9) return 'brush'
  if (deleteFlag.value) return 'erase'
  if (copyFlag.value) return 'copy'
  if (colorFlag.value) return 'color'
  if (shapeVariable.value >= 1 && shapeVariable.value <= 8) return `shape-${shapeVariable.value}`
  return ''
})

function setTool(tool: string, shapeNum?: number): void {
  state.setDeleteFlag(false)
  state.setCopyFlag(false)
  state.setColorFlag(false)
  state.setShapeVariable(shapeNum ?? 0)
  if (tool === 'brush') state.setShapeVariable(9)
  if (tool === 'erase') state.setDeleteFlag(true)
  if (tool === 'copy') state.setCopyFlag(true)
  if (tool === 'color') state.setColorFlag(true)
}

function clearAll(): void {
  state.resetFlags()
  state.setSelectedShapeId('')
  state.clearAll()
  paintApi.clearAll().catch(err => console.error('Error:', err))
}

const tools = [
  { key: 'brush',  icon: 'brush',               label: 'Brush' },
  { key: 'erase',  icon: 'ink_eraser',           label: 'Erase' },
  { key: 'copy',   icon: 'content_copy',         label: 'Copy'  },
  { key: 'color',  icon: 'format_color_fill',    label: 'Fill'  },
]

const shapes = [
  { key: 'shape-1', icon: 'square',           label: 'Square',    num: 1 },
  { key: 'shape-2', icon: 'rectangle',         label: 'Rectangle', num: 2 },
  { key: 'shape-4', icon: 'change_history',    label: 'Triangle',  num: 4 },
  { key: 'shape-5', icon: 'circle',            label: 'Circle',    num: 5 },
  { key: 'shape-3', icon: 'panorama_fish_eye', label: 'Ellipse',   num: 3, iconTransform: 'scaleX(1.5) scaleY(0.7)' },
  { key: 'shape-6', icon: 'horizontal_rule',   label: 'Line',      num: 6 },
  { key: 'shape-7', icon: 'pentagon',          label: 'Pentagon',  num: 7 },
  { key: 'shape-8', icon: 'hexagon',           label: 'Hexagon',   num: 8 },
]
</script>

<template>
  <aside class="shapes-sidebar">
    <div class="sidebar-inner">
      <div class="scroll-area">
        <button
          v-for="tool in tools"
          :key="tool.key"
          class="tool-btn"
          :class="{ active: activeTool === tool.key }"
          :title="tool.label"
          @click="setTool(tool.key)"
        >
          <span class="material-symbols-outlined">{{ tool.icon }}</span>
        </button>

        <button class="tool-btn" title="Clear All" @click="clearAll">
          <span class="material-symbols-outlined">delete</span>
        </button>

        <div class="separator" />

        <button
          v-for="shape in shapes"
          :key="shape.key"
          class="tool-btn"
          :class="{ active: activeTool === shape.key }"
          :title="shape.label"
          @click="setTool(shape.key, shape.num)"
        >
          <span
            class="material-symbols-outlined"
            :style="shape.iconTransform ? { transform: shape.iconTransform } : {}"
          >{{ shape.icon }}</span>
        </button>
      </div>

      <div class="scroll-fade" />
    </div>
  </aside>
</template>

<style scoped>
.shapes-sidebar {
  position: fixed;
  left: 16px;
  top: 72px;
  bottom: 16px;
  width: 64px;
  z-index: 40;
  display: flex;
  flex-direction: column;
}

.sidebar-inner {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: rgba(25, 26, 26, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(72, 72, 72, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.scroll-area {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px 48px;
  /* hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}

.scroll-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to top, rgba(25, 26, 26, 0.92) 0%, transparent 100%);
  pointer-events: none;
  border-radius: 0 0 12px 12px;
}

.tool-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  color: #acabaa;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.tool-btn:hover {
  background-color: #2b2c2c;
  color: #e7e5e5;
}

.tool-btn.active {
  background: linear-gradient(135deg, #c6c6c7, #b8b9b9);
  color: #3f4041;
}

.tool-btn.active:hover {
  background: linear-gradient(135deg, #c6c6c7, #b8b9b9);
  color: #3f4041;
}

.separator {
  width: 32px;
  height: 1px;
  background-color: #252626;
  margin: 8px 0;
  flex-shrink: 0;
}

.material-symbols-outlined {
  font-size: 22px;
  display: inline-block;
}
</style>
