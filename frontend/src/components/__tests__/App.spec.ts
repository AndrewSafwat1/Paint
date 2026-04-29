import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, provide, h } from 'vue'
import App from '../../App.vue'

vi.mock('../AppHeader.vue', () => ({
  default: defineComponent({ emits: ['save', 'load'], template: '<div />' }),
}))
vi.mock('../ShapesSidebar.vue', () => ({
  default: defineComponent({ template: '<div />' }),
}))
vi.mock('../OptionsSidebar.vue', () => ({
  default: defineComponent({ template: '<div />' }),
}))
vi.mock('../PaintCanvas.vue', () => ({
  default: defineComponent({ template: '<div />' }),
}))

vi.mock('../../services/paintApi', () => ({
  paintApi: {
    saveContent: vi.fn(),
    loadContent: vi.fn(),
  },
}))

import { paintApi } from '../../services/paintApi'

afterEach(() => { vi.clearAllMocks() })

describe('App.vue — load', () => {
  it('unsupported file extension shows toast and does not call loadContent', async () => {
    const wrapper = mount(App)
    const file = new File(['data'], 'image.txt')
    await (wrapper.vm as any).load(file)
    expect(paintApi.loadContent).not.toHaveBeenCalled()
    expect(wrapper.find('.toast-error').exists()).toBe(true)
  })

  it('.json file calls loadContent and populates state', async () => {
    vi.mocked(paintApi.loadContent).mockResolvedValue({
      idCounter: '7',
      lastUpdate: [{ id: '1', name: 'circle', radius: 60, fill: '#fff', stroke: 'black', strokeWidth: 3, draggable: true }],
    } as any)
    const wrapper = mount(App)
    const file = new File(['{"idCounter":"7","lastUpdate":[]}'], 'canvas.json', { type: 'application/json' })
    await (wrapper.vm as any).load(file)
    expect(paintApi.loadContent).toHaveBeenCalledOnce()
    expect(wrapper.find('.toast-error').exists()).toBe(false)
  })

  it('.xml file is accepted', async () => {
    vi.mocked(paintApi.loadContent).mockResolvedValue({ idCounter: '0', lastUpdate: [] } as any)
    const wrapper = mount(App)
    const file = new File(['<xml/>'], 'canvas.xml', { type: 'application/xml' })
    await (wrapper.vm as any).load(file)
    expect(paintApi.loadContent).toHaveBeenCalledOnce()
  })

  it('loadContent rejection shows parse-error toast', async () => {
    vi.mocked(paintApi.loadContent).mockRejectedValue(new Error('bad json'))
    const wrapper = mount(App)
    const file = new File(['bad'], 'canvas.json')
    await (wrapper.vm as any).load(file)
    expect(wrapper.find('.toast-error').text()).toContain('Failed to parse')
  })
})

describe('App.vue — save', () => {
  beforeEach(() => {
    // Provide a real-looking file picker that resolves so saveContent is reached
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue({ name: 'canvas.json' }))
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:fake'), revokeObjectURL: vi.fn() })
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('saveContent rejection shows save-error toast', async () => {
    vi.mocked(paintApi.saveContent).mockRejectedValue(new Error('server error'))
    const wrapper = mount(App)
    await (wrapper.vm as any).save()
    expect(wrapper.find('.toast-error').text()).toContain('Failed to save')
  })
})

describe('App.vue — toast', () => {
  it('clicking the toast clears it', async () => {
    vi.mocked(paintApi.loadContent).mockRejectedValue(new Error('x'))
    const wrapper = mount(App)
    const file = new File(['bad'], 'canvas.json')
    await (wrapper.vm as any).load(file)
    expect(wrapper.find('.toast-error').exists()).toBe(true)
    await wrapper.find('.toast-error').trigger('click')
    expect(wrapper.find('.toast-error').exists()).toBe(false)
  })
})
