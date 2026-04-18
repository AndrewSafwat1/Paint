import type { DefineComponent } from 'vue'

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    VStage: DefineComponent
    VLayer: DefineComponent
    VCircle: DefineComponent
    VRect: DefineComponent
    VEllipse: DefineComponent
    VLine: DefineComponent
    VRegularPolygon: DefineComponent
    VTransformer: DefineComponent
  }
}
