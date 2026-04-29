import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import { useShapeState } from '../useShapeState'
import { paintApi } from '../../services/paintApi'
import type { CircleShape } from '../../types/shapes'

const circle = (id = 'c1', x = 100, y = 100): CircleShape => ({
  id, name: 'circle', x, y, radius: 60, fill: '#fff', stroke: 'black',
  strokeWidth: 3, draggable: true,
})

type Wrapper = ReturnType<typeof mount>
const wrappers: Wrapper[] = []

function mountWithShortcuts(state: ReturnType<typeof useShapeState>): Wrapper {
  const Harness = defineComponent({
    setup() {
      useKeyboardShortcuts(state)
      return () => h('div')
    },
  })
  const w = mount(Harness, { attachTo: document.body })
  wrappers.push(w)
  return w
}

function key(opts: KeyboardEventInit & { key: string }, target?: EventTarget) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts })
  ;(target ?? window).dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  let state: ReturnType<typeof useShapeState>

  beforeEach(() => {
    state = useShapeState()
    vi.spyOn(paintApi, 'undo').mockResolvedValue([])
    vi.spyOn(paintApi, 'redo').mockResolvedValue([])
    vi.spyOn(paintApi, 'removeShape').mockResolvedValue([])
    // mirror backend behaviour: copy ctor adds +20/+20 offset
    vi.spyOn(paintApi, 'cloneShape').mockImplementation(async (_old, newId, shape) => {
      const c = shape as CircleShape
      return { ...c, id: newId, x: (c.x ?? 0) + 20, y: (c.y ?? 0) + 20 } as CircleShape
    })
  })

  afterEach(() => {
    while (wrappers.length) wrappers.pop()!.unmount()
    vi.restoreAllMocks()
  })

  // ── undo / redo ───────────────────────────────────────────────────────────

  it('Ctrl+Z calls paintApi.undo', async () => {
    mountWithShortcuts(state)
    key({ key: 'z', ctrlKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.undo).toHaveBeenCalledOnce()
    expect(paintApi.redo).not.toHaveBeenCalled()
  })

  it('Cmd+Z (metaKey) also calls undo for Mac users', async () => {
    mountWithShortcuts(state)
    key({ key: 'z', metaKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.undo).toHaveBeenCalledOnce()
  })

  it('Ctrl+Y calls paintApi.redo', async () => {
    mountWithShortcuts(state)
    key({ key: 'y', ctrlKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.redo).toHaveBeenCalledOnce()
  })

  it('Ctrl+Shift+Z calls paintApi.redo, not undo', async () => {
    mountWithShortcuts(state)
    key({ key: 'z', ctrlKey: true, shiftKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.redo).toHaveBeenCalledOnce()
    expect(paintApi.undo).not.toHaveBeenCalled()
  })

  // ── delete ────────────────────────────────────────────────────────────────

  it('Delete removes the selected shape', async () => {
    state.addShape(circle('c1'))
    state.setSelectedShapeId('c1')
    mountWithShortcuts(state)

    key({ key: 'Delete' })
    await nextTick(); await Promise.resolve()
    expect(paintApi.removeShape).toHaveBeenCalledWith('c1')
    expect(state.selectedShapeId.value).toBe('')
  })

  it('Backspace also removes the selected shape', async () => {
    state.addShape(circle('c2'))
    state.setSelectedShapeId('c2')
    mountWithShortcuts(state)

    key({ key: 'Backspace' })
    await nextTick(); await Promise.resolve()
    expect(paintApi.removeShape).toHaveBeenCalledWith('c2')
  })

  it('Delete with no selection is a no-op', async () => {
    mountWithShortcuts(state)
    key({ key: 'Delete' })
    await nextTick(); await Promise.resolve()
    expect(paintApi.removeShape).not.toHaveBeenCalled()
  })

  // ── duplicate ─────────────────────────────────────────────────────────────

  it('Ctrl+C duplicates the selected shape via the server clone command', async () => {
    state.addShape(circle('c1', 100, 200))
    state.setSelectedShapeId('c1')
    mountWithShortcuts(state)

    key({ key: 'c', ctrlKey: true })
    await nextTick(); await Promise.resolve(); await Promise.resolve()

    expect(paintApi.cloneShape).toHaveBeenCalledOnce()
    const [oldId, newId] = (paintApi.cloneShape as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(oldId).toBe('c1')

    const added = state.allshapes.value[1] as CircleShape
    expect(added.id).toBe(newId)
    expect(added.x).toBe(120)
    expect(added.y).toBe(220)
    expect(state.selectedShapeId.value).toBe(newId)
  })

  it('Ctrl+V behaves the same as Ctrl+C', async () => {
    state.addShape(circle('c1', 50, 50))
    state.setSelectedShapeId('c1')
    mountWithShortcuts(state)

    key({ key: 'v', ctrlKey: true })
    await nextTick(); await Promise.resolve(); await Promise.resolve()

    expect(paintApi.cloneShape).toHaveBeenCalledOnce()
    const added = state.allshapes.value[1] as CircleShape
    expect(added.x).toBe(70)
    expect(added.y).toBe(70)
  })

  it('Ctrl+C with no selection is a no-op', async () => {
    mountWithShortcuts(state)
    key({ key: 'c', ctrlKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.cloneShape).not.toHaveBeenCalled()
  })

  // ── editable target guard ─────────────────────────────────────────────────

  it('ignores Ctrl+Z when fired from an INPUT element', async () => {
    mountWithShortcuts(state)
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    key({ key: 'z', ctrlKey: true }, input)
    await nextTick(); await Promise.resolve()
    expect(paintApi.undo).not.toHaveBeenCalled()

    input.remove()
  })

  it('ignores Delete when typing in a textarea', async () => {
    state.addShape(circle('c1'))
    state.setSelectedShapeId('c1')
    mountWithShortcuts(state)

    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    ta.focus()

    key({ key: 'Delete' }, ta)
    await nextTick(); await Promise.resolve()
    expect(paintApi.removeShape).not.toHaveBeenCalled()

    ta.remove()
  })

  // ── unmount cleanup ───────────────────────────────────────────────────────

  it('removes the listener on unmount', async () => {
    const wrapper = mountWithShortcuts(state)
    wrapper.unmount()
    key({ key: 'z', ctrlKey: true })
    await nextTick(); await Promise.resolve()
    expect(paintApi.undo).not.toHaveBeenCalled()
  })
})

