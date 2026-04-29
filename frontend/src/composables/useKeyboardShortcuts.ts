import { onMounted, onUnmounted } from 'vue'
import type { ShapeState } from './useShapeState'
import { paintApi } from '../services/paintApi'
import type { AnyShape } from '../types/shapes'

function isFromEditableTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null
  if (!t) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (t.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(state: ShapeState): void {
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

  async function deleteSelected(): Promise<void> {
    const id = state.selectedShapeId.value
    if (!id) return
    state.setSelectedShapeId('')
    const shapes = await paintApi.removeShape(id).catch(err => {
      console.error('Error:', err)
      return state.allshapes.value as AnyShape[]
    })
    state.setAllShapes(shapes)
  }

  async function duplicateSelected(): Promise<void> {
    const id = state.selectedShapeId.value
    if (!id) return
    const original = state.allshapes.value.find(s => s.id === id)
    if (!original) return

    const newId = state.nextId()
    const cloned = await paintApi.cloneShape(id, newId, original).catch(err => {
      console.error('Error:', err)
      return null
    })
    if (!cloned) return

    state.addShape(cloned)
    state.setSelectedShapeId(newId)
  }

  async function onKeyDown(e: KeyboardEvent): Promise<void> {
    if (isFromEditableTarget(e)) return

    const ctrl = e.ctrlKey || e.metaKey
    const key = e.key.toLowerCase()

    if (ctrl && !e.shiftKey && key === 'z') {
      e.preventDefault()
      await undo()
      return
    }
    if (ctrl && (key === 'y' || (e.shiftKey && key === 'z'))) {
      e.preventDefault()
      await redo()
      return
    }
    if (ctrl && (key === 'c' || key === 'v')) {
      if (!state.selectedShapeId.value) return
      e.preventDefault()
      await duplicateSelected()
      return
    }
    if (key === 'delete' || key === 'backspace') {
      if (!state.selectedShapeId.value) return
      e.preventDefault()
      await deleteSelected()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}

export const __testing = { isFromEditableTarget }
