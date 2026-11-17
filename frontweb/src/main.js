import { createApp, h } from 'vue'
import './styles/theme.css'
// 初始化主题（必须在挂载前执行）
import './composables/useTheme.js'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { ElConfigProvider } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import ru from 'element-plus/dist/locale/ru.mjs'
import { language, translate } from './localization'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const locales = { ru, en, zh: zhCn }

const app = createApp({
  name: 'RootProvider',
  render() {
    return h(
      ElConfigProvider,
      {
        locale: locales[language.value],
        message: {
          duration: 5000,
          showClose: true,
          offset: 28,
        },
      },
      () => h(App)
    )
  },
})
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: locales[language.value] })
app.config.globalProperties.$t = translate
app.mount('#app')
