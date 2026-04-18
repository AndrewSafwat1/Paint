import { createApp } from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import './assets/styles/main.css'

const app = createApp(App)
app.use(VueKonva)
app.mount('#app')
