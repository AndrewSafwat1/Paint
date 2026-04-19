<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'

const state = inject(ShapeStateKey)!
const { activeColor, colorFlag } = state

const hsv = reactive({ h: 0, s: 1, v: 0.8 })
const gradientRef = ref<HTMLElement | null>(null)
let internalUpdate = false

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
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

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`
}

function syncHsvFromActiveColor(): void {
  if (activeColor.value.length !== 7) return
  const result = hexToHsv(activeColor.value)
  hsv.h = result.h
  hsv.s = result.s
  hsv.v = result.v
}

function applyHsv(): void {
  internalUpdate = true
  state.setActiveColor(hsvToHex(hsv.h, hsv.s, hsv.v))
  setTimeout(() => { internalUpdate = false }, 0)
}

const gradientBackground = computed(() => {
  const hue = Math.round(hsv.h)
  return `linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, hsl(${hue}, 100%, 50%) 100%)`
})

const cursorLeft = computed(() => `${hsv.s * 100}%`)
const cursorTop = computed(() => `${(1 - hsv.v) * 100}%`)

function onGradientMouseDown(e: MouseEvent): void {
  e.preventDefault()
  const rect = gradientRef.value!.getBoundingClientRect()
  function update(ev: MouseEvent) {
    hsv.s = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    hsv.v = Math.max(0, Math.min(1, 1 - (ev.clientY - rect.top) / rect.height))
    applyHsv()
  }
  update(e)
  function onMove(ev: MouseEvent) { update(ev) }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onHueInput(e: Event): void {
  hsv.h = Number((e.target as HTMLInputElement).value)
  applyHsv()
}

const hexDisplay = computed(() => activeColor.value.toUpperCase())

onMounted(syncHsvFromActiveColor)
</script>

<template>
  <aside class="color-panel">
    <div class="panel-header">
      <h2 class="panel-title">Color</h2>
      <span class="material-symbols-outlined panel-icon">palette</span>
    </div>

    <div
      ref="gradientRef"
      class="gradient-box"
      :style="{ background: gradientBackground }"
      @mousedown="onGradientMouseDown"
    >
      <div
        class="picker-cursor"
        :style="{ left: cursorLeft, top: cursorTop }"
      />
    </div>

    <div class="hue-track">
      <input
        type="range"
        min="0"
        max="360"
        :value="Math.round(hsv.h)"
        class="hue-slider"
        @input="onHueInput"
      >
    </div>

    <div class="hex-row">
      <div class="color-swatch" :style="{ backgroundColor: activeColor }" />
      <div class="hex-box">
        <span class="hex-label">HEX</span>
        <span class="hex-value">{{ hexDisplay }}</span>
      </div>
    </div>

    <button
      class="fill-btn"
      :class="{ active: colorFlag }"
      title="Apply color to shape on click"
      @click="state.setDeleteFlag(false); state.setCopyFlag(false); state.setShapeVariable(0); state.setColorFlag(!colorFlag)"
    >
      <span class="material-symbols-outlined">format_color_fill</span>
      <span class="fill-btn-label">Fill shape</span>
    </button>
  </aside>
</template>

<style scoped>
.color-panel {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 272px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: rgba(37, 38, 38, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(72, 72, 72, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #e7e5e5;
}

.panel-icon {
  font-size: 18px;
  color: #acabaa;
}

.gradient-box {
  width: 100%;
  height: 128px;
  border-radius: 8px;
  position: relative;
  cursor: crosshair;
  user-select: none;
  border: 1px solid rgba(72, 72, 72, 0.2);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.picker-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hue-track {
  width: 100%;
  height: 16px;
  position: relative;
}

.hue-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    hsl(0,100%,50%),
    hsl(30,100%,50%),
    hsl(60,100%,50%),
    hsl(90,100%,50%),
    hsl(120,100%,50%),
    hsl(150,100%,50%),
    hsl(180,100%,50%),
    hsl(210,100%,50%),
    hsl(240,100%,50%),
    hsl(270,100%,50%),
    hsl(300,100%,50%),
    hsl(330,100%,50%),
    hsl(360,100%,50%)
  );
  cursor: pointer;
  outline: none;
  border: none;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.hue-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.hex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(72, 72, 72, 0.2);
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.hex-box {
  flex: 1;
  background-color: #252626;
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hex-label {
  font-size: 11px;
  color: #acabaa;
  font-family: 'Inter', sans-serif;
}

.hex-value {
  font-size: 13px;
  color: #e7e5e5;
  font-family: 'Inter', monospace;
  letter-spacing: 0.05em;
}

.fill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: 1px solid rgba(72, 72, 72, 0.4);
  border-radius: 8px;
  color: #acabaa;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  transition: all 0.2s;
}

.fill-btn:hover {
  background-color: #2b2c2c;
  color: #e7e5e5;
}

.fill-btn.active {
  background: linear-gradient(135deg, #c6c6c7, #b8b9b9);
  color: #3f4041;
  border-color: transparent;
}

.fill-btn .material-symbols-outlined {
  font-size: 18px;
}

.fill-btn-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
