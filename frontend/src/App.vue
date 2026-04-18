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

const name = shallowRef('')
const path = shallowRef('')
const format = shallowRef('json')

async function save(): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')
  const fullPath = `${path.value}\\${name.value}.${format.value}`
  await paintApi.save(fullPath, String(state.id.value)).catch(err => console.error('Error saving:', err))
}

async function load(): Promise<void> {
  state.resetFlags()
  state.setSelectedShapeId('')
  try {
    const { idCounter, lastUpdate } = await paintApi.load(path.value)
    state.setId(idCounter)
    state.setAllShapes(lastUpdate)
  } catch (err) {
    console.error('Error loading:', err)
  }
}
</script>

<template>
  <AppHeader
    v-model:name="name"
    v-model:path="path"
    v-model:format="format"
    @save="save"
    @load="load"
  />
  <div class="main-container">
    <ShapesSidebar />
    <PaintCanvas />
    <OptionsSidebar />
  </div>
</template>
