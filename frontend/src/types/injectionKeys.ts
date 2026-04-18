import type { InjectionKey } from 'vue'
import type { ShapeState } from '../composables/useShapeState'

export const ShapeStateKey: InjectionKey<ShapeState> = Symbol('shapeState')
