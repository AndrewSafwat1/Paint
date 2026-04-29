import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { useShapeState } from '../../composables/useShapeState'
import { ShapeStateKey } from '../../types/injectionKeys'
import AppHeader from '../AppHeader.vue'
import type { CircleShape } from '../../types/shapes'

const circleShape: CircleShape = {
  id: '1', name: 'circle', radius: 60, fill: '#fff', stroke: 'black',
  strokeWidth: 3, draggable: true,
}

vi.mock('../../services/paintApi', () => ({
  paintApi: {
    undo: vi.fn().mockResolvedValue([]),
    redo: vi.fn().mockResolvedValue([]),
  },
}))

import { paintApi } from '../../services/paintApi'

function mountHeader() {
  const state = useShapeState()
  const wrapper = mount(AppHeader, {
    global: { provide: { [ShapeStateKey as symbol]: state } },
  })
  return { wrapper, state }
}

afterEach(() => { vi.clearAllMocks() })

describe('AppHeader', () => {
  // ── undo ──────────────────────────────────────────────────────────────────

  it('clicking undo calls paintApi.undo and populates allshapes', async () => {
    vi.mocked(paintApi.undo).mockResolvedValue([circleShape])
    const { state, wrapper } = mountHeader()

    await wrapper.find('[title="Undo"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(paintApi.undo).toHaveBeenCalledOnce()
    expect(state.allshapes.value).toEqual([circleShape])
  })

  it('clicking undo resets flags and clears selectedShapeId', async () => {
    const { state, wrapper } = mountHeader()
    state.setDeleteFlag(true)
    state.setSelectedShapeId('42')

    await wrapper.find('[title="Undo"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(state.deleteFlag.value).toBe(false)
    expect(state.selectedShapeId.value).toBe('')
  })

  // ── redo ──────────────────────────────────────────────────────────────────

  it('clicking redo calls paintApi.redo and populates allshapes', async () => {
    vi.mocked(paintApi.redo).mockResolvedValue([circleShape])
    const { state, wrapper } = mountHeader()

    await wrapper.find('[title="Redo"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(paintApi.redo).toHaveBeenCalledOnce()
    expect(state.allshapes.value).toEqual([circleShape])
  })

  // ── save ──────────────────────────────────────────────────────────────────

  it('clicking save emits the "save" event', async () => {
    const { wrapper } = mountHeader()
    await wrapper.find('[title="Save"]').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
  })

  // ── load / file input ─────────────────────────────────────────────────────

  it('clicking load triggers the hidden file input', async () => {
    const { wrapper } = mountHeader()
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click')
    await wrapper.find('[title="Load"]').trigger('click')
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('selecting a file emits "load" with the File object', async () => {
    const { wrapper } = mountHeader()
    const file = new File(['{}'], 'canvas.json', { type: 'application/json' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')

    const emitted = wrapper.emitted('load')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe(file)
  })

  it('does not emit "load" when file input has no files', async () => {
    const { wrapper } = mountHeader()
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [], configurable: true })
    await input.trigger('change')
    expect(wrapper.emitted('load')).toBeFalsy()
  })
})
