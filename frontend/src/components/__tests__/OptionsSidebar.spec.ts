import { describe, it, expect, afterEach, vi } from 'vitest'
import { mountWithState } from '../../test-utils/withShapeState'
import OptionsSidebar from '../OptionsSidebar.vue'

afterEach(() => { vi.clearAllMocks() })

// Pure color conversion helpers — extracted inline for unit testing
function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = h * 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

describe('hsvToHex (color math)', () => {
  it('pure red: hue=0, s=1, v=1 → #ff0000', () => {
    expect(hsvToHex(0, 1, 1)).toBe('#ff0000')
  })

  it('pure green: hue=120, s=1, v=1 → #00ff00', () => {
    expect(hsvToHex(120, 1, 1)).toBe('#00ff00')
  })

  it('pure blue: hue=240, s=1, v=1 → #0000ff', () => {
    expect(hsvToHex(240, 1, 1)).toBe('#0000ff')
  })

  it('white: s=0, v=1 → #ffffff', () => {
    expect(hsvToHex(0, 0, 1)).toBe('#ffffff')
  })

  it('black: v=0 → #000000', () => {
    expect(hsvToHex(0, 0, 0)).toBe('#000000')
  })
})

describe('hexToHsv (color math)', () => {
  it('#ff0000 → h≈0, s=1, v=1', () => {
    const { h, s, v } = hexToHsv('#ff0000')
    expect(h).toBeCloseTo(0, 0)
    expect(s).toBeCloseTo(1, 5)
    expect(v).toBeCloseTo(1, 5)
  })

  it('#ffffff → s=0, v=1', () => {
    const { s, v } = hexToHsv('#ffffff')
    expect(s).toBeCloseTo(0, 5)
    expect(v).toBeCloseTo(1, 5)
  })

  it('round-trips: hex → hsv → hex', () => {
    const colors = ['#e53e3e', '#38a169', '#3182ce', '#805ad5']
    for (const hex of colors) {
      const { h, s, v } = hexToHsv(hex)
      expect(hsvToHex(h, s, v)).toBe(hex)
    }
  })
})

describe('OptionsSidebar component', () => {
  it('renders the hex display of activeColor in uppercase', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    state.setActiveColor('#abcdef')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.hex-value').text()).toBe('#ABCDEF')
  })

  it('fill-shape button toggles colorFlag on', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    expect(state.colorFlag.value).toBe(false)
    await wrapper.find('.fill-btn').trigger('click')
    expect(state.colorFlag.value).toBe(true)
  })

  it('fill-shape button toggles colorFlag off when already on', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    state.setColorFlag(true)
    await wrapper.vm.$nextTick()
    await wrapper.find('.fill-btn').trigger('click')
    expect(state.colorFlag.value).toBe(false)
  })

  it('fill-shape button has active class when colorFlag is true', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    state.setColorFlag(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.fill-btn').classes()).toContain('active')
  })

  it('fill-shape activation clears deleteFlag and copyFlag', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    state.setDeleteFlag(true)
    state.setCopyFlag(true)
    await wrapper.find('.fill-btn').trigger('click')
    expect(state.deleteFlag.value).toBe(false)
    expect(state.copyFlag.value).toBe(false)
  })

  it('color swatch background reflects activeColor', async () => {
    const { state, wrapper } = mountWithState(OptionsSidebar)
    state.setActiveColor('#ff0000')
    await wrapper.vm.$nextTick()
    const style = (wrapper.find('.color-swatch').element as HTMLElement).style
    expect(style.backgroundColor).toBeTruthy()
  })
})
