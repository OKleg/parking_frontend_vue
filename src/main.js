import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initializeStores } from './stores/init'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Иконки Element Plus
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Инициализация хранилищ перед монтированием
initializeStores()
  .then(() => {
    app.mount('#app')
    console.log('Приложение запущено')
  })
  .catch((error) => {
    console.error('Ошибка запуска приложения:', error)
  })
// app.mount('#app')
