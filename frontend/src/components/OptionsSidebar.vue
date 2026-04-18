<script setup lang="ts">
import { inject } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'
import { paintApi } from '../services/paintApi'

const state = inject(ShapeStateKey)!
const { activeColor } = state

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

function clear(): void {
  state.resetFlags()
  state.setSelectedShapeId('')
  state.clearAll()
  paintApi.clearAll().catch(err => console.error('Error:', err))
}

function setErase(): void {
  state.setDeleteFlag(true)
  state.setCopyFlag(false)
  state.setColorFlag(false)
}

function setCopy(): void {
  state.setDeleteFlag(false)
  state.setCopyFlag(true)
  state.setColorFlag(false)
}

function setColor(): void {
  state.setDeleteFlag(false)
  state.setCopyFlag(false)
  state.setColorFlag(true)
}

function onColorChange(e: Event): void {
  state.setActiveColor((e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="sidenavoption">
    <p
      id="option"
      class="title"
    >
      Options
    </p>
    <ul>
      <li>
        <img
          class="images"
          src="@/assets/undo.png"
          alt=""
        >
        <button
          id="undo"
          class="options"
          @click="undo"
        >
          Undo
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/redo.png"
          alt=""
        >
        <button
          id="redo"
          class="options"
          @click="redo"
        >
          Redo
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/eraser.svg"
          alt=""
        >
        <button
          id="erase"
          class="options"
          @click="setErase"
        >
          Erase
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/copy.png"
          alt=""
        >
        <button
          id="copy"
          class="options"
          @click="setCopy"
        >
          Copy
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/clear.png"
          alt=""
          style="width:14px"
        >
        <button
          id="clear"
          class="options"
          @click="clear"
        >
          Clear
        </button>
      </li>
    </ul>
    <form>
      <label
        id="selectcolor"
        for="color"
      >Select Color</label>
      <input
        id="color"
        type="color"
        :value="activeColor"
        @click="setColor"
        @change="onColorChange"
      >
    </form>
  </div>
</template>
