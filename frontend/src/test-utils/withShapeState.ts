import { defineComponent, provide, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { useShapeState } from '../composables/useShapeState'
import { ShapeStateKey } from '../types/injectionKeys'

export function mountWithState(component: Component, options: Record<string, unknown> = {}) {
  const state = useShapeState()

  const wrapper = mount(defineComponent({
    setup() {
      provide(ShapeStateKey, state)
      return () => h(component as any)
    },
  }), options)

  return { wrapper, state }
}
