import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountWithState } from '../../test-utils/withShapeState'
import ShapesSidebar from '../ShapesSidebar.vue'

vi.mock('../../services/paintApi', () => ({
  paintApi: { clearAll: vi.fn().mockResolvedValue(undefined) },
}))

import { paintApi } from '../../services/paintApi'

describe('ShapesSidebar', () => {
  afterEach(() => { vi.clearAllMocks() })

  // ── activeTool computed ───────────────────────────────────────────────────

  it('activeTool is "brush" when shapeVariable is 9', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setShapeVariable(9)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[title="Brush"]').classes()).toContain('active')
  })

  it('activeTool is "erase" when deleteFlag is true', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setDeleteFlag(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[title="Erase"]').classes()).toContain('active')
  })

  it('activeTool is "copy" when copyFlag is true', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setCopyFlag(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[title="Copy"]').classes()).toContain('active')
  })

  it('activeTool is "color" when colorFlag is true', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setColorFlag(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[title="Fill"]').classes()).toContain('active')
  })

  it('activeTool is "shape-5" when shapeVariable is 5', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setShapeVariable(5)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[title="Circle"]').classes()).toContain('active')
  })

  it('no button is active when all flags are false and shapeVariable is 0', () => {
    const { wrapper } = mountWithState(ShapesSidebar)
    const activeButtons = wrapper.findAll('.tool-btn.active')
    expect(activeButtons).toHaveLength(0)
  })

  // ── setTool flag mutual exclusivity ──────────────────────────────────────

  it('clicking erase sets deleteFlag and clears other flags', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setCopyFlag(true)
    await wrapper.find('[title="Erase"]').trigger('click')
    expect(state.deleteFlag.value).toBe(true)
    expect(state.copyFlag.value).toBe(false)
    expect(state.colorFlag.value).toBe(false)
    expect(state.shapeVariable.value).toBe(0)
  })

  it('clicking brush sets shapeVariable 9 and clears flags', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setDeleteFlag(true)
    await wrapper.find('[title="Brush"]').trigger('click')
    expect(state.shapeVariable.value).toBe(9)
    expect(state.deleteFlag.value).toBe(false)
  })

  it('clicking a shape button sets shapeVariable and clears flags', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setDeleteFlag(true)
    await wrapper.find('[title="Circle"]').trigger('click')
    expect(state.shapeVariable.value).toBe(5)
    expect(state.deleteFlag.value).toBe(false)
  })

  it('activating shape deactivates a previously active shape', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    state.setShapeVariable(2)
    await wrapper.find('[title="Circle"]').trigger('click')
    expect(state.shapeVariable.value).toBe(5)
    expect(wrapper.find('[title="Rectangle"]').classes()).not.toContain('active')
  })

  // ── clearAll ──────────────────────────────────────────────────────────────

  it('clicking Clear All calls state.clearAll and paintApi.clearAll', async () => {
    const { state, wrapper } = mountWithState(ShapesSidebar)
    const clearAllSpy = vi.spyOn(state, 'clearAll')

    await wrapper.find('[title="Clear All"]').trigger('click')

    expect(clearAllSpy).toHaveBeenCalledOnce()
    expect(paintApi.clearAll).toHaveBeenCalledOnce()
  })
})
