<script setup lang="ts">
import { provide, shallowRef } from 'vue'
import { useShapeState } from './composables/useShapeState'
import { ShapeStateKey } from './types/injectionKeys'
import { paintApi } from './services/paintApi'
import AppHeader from './components/AppHeader.vue'
import ShapesSidebar from './components/ShapesSidebar.vue'
import OptionsSidebar from './components/OptionsSidebar.vue'
import PaintCanvas from './components/PaintCanvas.vue'

const state = useShapeState()
provide(ShapeStateKey, state)

const toastError = shallowRef('')

async function save(): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')

  let format = 'json'
  let filename = 'canvas.json'
  let fileHandle: unknown = null

  if ('showSaveFilePicker' in window) {
    try {
      fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: 'canvas.json',
        types: [
          { description: 'JSON File', accept: { 'application/json': ['.json'] } },
          { description: 'XML File',  accept: { 'application/xml':  ['.xml']  } },
        ],
      })
      filename = (fileHandle as any).name as string
      format   = filename.endsWith('.xml') ? 'xml' : 'json'
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return
      throw e
    }
  }

  try {
    const content = await paintApi.saveContent(format, String(state.id.value))

    if (fileHandle) {
      const writable = await (fileHandle as any).createWritable()
      await writable.write(content)
      await writable.close()
    } else {
      const mime = format === 'xml' ? 'application/xml' : 'application/json'
      const blob = new Blob([content], { type: mime })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch {
    toastError.value = 'Failed to save the file. Please try again.'
  }
}

async function load(file: File): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'xml' && ext !== 'json') {
    toastError.value = 'Unsupported file type. Please select an .xml or .json file.'
    return
  }

  try {
    const content = await file.text()
    const { idCounter, lastUpdate } = await paintApi.loadContent(content, ext)
    state.setId(Number(idCounter))
    state.setAllShapes(lastUpdate)
  } catch {
    toastError.value = 'Failed to parse the file. Make sure it is a valid canvas XML or JSON file.'
  }
}
</script>

<template>
  <AppHeader
    @save="save"
    @load="load"
  />
  <div class="main-container">
    <ShapesSidebar />
    <PaintCanvas />
    <OptionsSidebar />
  </div>

  <Transition name="toast">
    <div
      v-if="toastError"
      class="toast-error"
      role="alert"
      @click="toastError = ''"
    >
      {{ toastError }}
      <span class="toast-close">✕</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast-error {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: #c0392b;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-family: Arial, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  max-width: 360px;
}

.toast-close {
  font-weight: bold;
  flex-shrink: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
