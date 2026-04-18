<script setup lang="ts">
const props = defineProps<{
  name: string
  path: string
  format: string
}>()

const emit = defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:path', value: string): void
  (e: 'update:format', value: string): void
  (e: 'save'): void
  (e: 'load'): void
}>()
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
            style="margin-right: 10px;"
            @click="emit('load')"
          >
            Load
          </button>
          <img
            class="images"
            src="@/assets/load.png"
            alt=""
          >
        </div>

        <div class="inputs">
          <input
            :value="props.name"
            type="text"
            class="name"
            placeholder="Enter name of file"
            style="display: inline;"
            @input="emit('update:name', ($event.target as HTMLInputElement).value)"
          >
          <input
            :value="props.path"
            type="text"
            class="save"
            placeholder="File path to save (xml / json)"
            @input="emit('update:path', ($event.target as HTMLInputElement).value)"
          >
          <input
            :value="props.path"
            type="text"
            class="load"
            placeholder="File path to load (xml / json)"
            @input="emit('update:path', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="format">
          <ul id="extension">
            <li id="xml">
              <input
                type="radio"
                name="radio"
                value="xml"
                :checked="props.format === 'xml'"
                @change="emit('update:format', 'xml')"
              >xml
            </li>
            <li id="json">
              <input
                type="radio"
                name="radio"
                value="json"
                :checked="props.format === 'json'"
                @change="emit('update:format', 'json')"
              >json
            </li>
          </ul>
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
