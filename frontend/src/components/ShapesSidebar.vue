<script setup lang="ts">
import { inject } from 'vue'
import { ShapeStateKey } from '../types/injectionKeys'

const state = inject(ShapeStateKey)!
const { shapeVariable } = state

function handleShape(n: number): void {
  state.setShapeVariable(n >= 1 && n <= 8 ? n : 0)
}

function handleBrush(): void {
  state.setShapeVariable(shapeVariable.value === 9 ? 0 : 9)
}
</script>

<template>
  <div class="sidenavshape">
    <p
      id="shape"
      class="title"
    >
      Shapes
    </p>
    <ul class="buttonshape">
      <li>
        <img
          class="images"
          src="@/assets/square.png"
          alt=""
        >
        <button
          id="square"
          class="shapes"
          @click="handleShape(1)"
        >
          Square
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/rectangle.png"
          alt=""
        >
        <button
          id="rectangle"
          class="shapes"
          @click="handleShape(2)"
        >
          Rectangle
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/triangle.svg"
          alt=""
        >
        <button
          id="triangle"
          class="shapes"
          @click="handleShape(4)"
        >
          Triangle
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/circle.svg"
          alt=""
        >
        <button
          id="circle"
          class="shapes"
          @click="handleShape(5)"
        >
          Circle
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/ellipse.png"
          alt=""
        >
        <button
          id="ellipse"
          class="shapes"
          @click="handleShape(3)"
        >
          Ellipse
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/line.png"
          alt=""
        >
        <button
          id="line"
          class="shapes"
          @click="handleShape(6)"
        >
          Line
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/pentagon.png"
          alt=""
        >
        <button
          id="pentagon"
          class="shapes"
          @click="handleShape(7)"
        >
          Pentagon
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/hexagon.png"
          alt=""
        >
        <button
          id="hexagon"
          class="shapes"
          @click="handleShape(8)"
        >
          Hexagon
        </button>
      </li>
      <li>
        <img
          class="images"
          src="@/assets/brush.svg"
          alt=""
        >
        <button
          id="brush"
          class="shapes"
          :class="{ active: shapeVariable === 9 }"
          @click="handleBrush"
        >
          brush
        </button>
      </li>
    </ul>
  </div>
</template>
