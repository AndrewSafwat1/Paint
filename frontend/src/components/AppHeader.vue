<script setup lang="ts">
import { ref, inject } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'
import { paintApi } from '../services/paintApi'

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'load', file: File): void
}>()

const state = inject(ShapeStateKey)!
const fileInput = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('load', file)
    ;(event.target as HTMLInputElement).value = ''
  }
}

async function undo(): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')
  const shapes = await paintApi.undo().catch(err => { console.error('Error:', err); return [] })
  state.setAllShapes(shapes)
}

async function redo(): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')
  const shapes = await paintApi.redo().catch(err => { console.error('Error:', err); return [] })
  state.setAllShapes(shapes)
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <span class="app-title">Andrew's Board</span>
    </div>
    <div class="header-right">
      <button class="icon-btn" title="Undo" @click="undo">
        <span class="material-symbols-outlined">undo</span>
      </button>
      <button class="icon-btn" title="Redo" @click="redo">
        <span class="material-symbols-outlined">redo</span>
      </button>
      <button class="icon-btn" title="Save" @click="emit('save')">
        <span class="material-symbols-outlined">save</span>
      </button>
      <button class="icon-btn" title="Load" @click="openFileDialog">
        <span class="material-symbols-outlined">folder_open</span>
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".xml,.json"
        style="display: none"
        @change="onFileSelected"
      >
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 0 24px;
  background-color: #0e0e0e;
  flex-shrink: 0;
  z-index: 50;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.05em;
  color: #e7e5e5;
  text-transform: uppercase;
}

.header-nav {
  display: flex;
  gap: 16px;
}

.nav-btn {
  background: none;
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.05em;
  color: #acabaa;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0;
}

.nav-btn:hover {
  color: #e7e5e5;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: 50%;
  color: #c6c6c7;
  cursor: pointer;
  transition: background-color 0.3s;
}

.icon-btn:hover {
  background-color: #2b2c2c;
}

.material-symbols-outlined {
  font-size: 20px;
}
</style>
