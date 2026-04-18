<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'load', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('load', file)
    ;(event.target as HTMLInputElement).value = ''
  }
}
</script>

<template>
  <div class="control-header">
    <img
      class="imagesmain2"
      src="@/assets/background.png"
      alt=""
    >
    <header id="header">
      <div class="draw">
        <div class="save-load">
          <img
            class="images"
            src="@/assets/save.png"
            alt=""
          >
          <button
            id="save"
            @click="emit('save')"
          >
            Save
          </button>
          <button
            id="load"
            @click="openFileDialog"
          >
            Load
          </button>
          <img
            class="images"
            src="@/assets/load.png"
            alt=""
          >
          <input
            ref="fileInput"
            type="file"
            accept=".xml,.json"
            style="display: none"
            @change="onFileSelected"
          >
        </div>
      </div>
    </header>
    <img
      class="imagesmain1"
      src="@/assets/background.png"
      alt=""
    >
  </div>
</template>
