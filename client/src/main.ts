import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles/global.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563EB',
          secondary: '#64748B',
          accent: '#2563EB',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#06B6D4',
          success: '#10B981',
          surface: '#ffffff',
          background: '#ffffff',
          'on-surface': '#0F172A',
          'on-primary': '#ffffff',
          'surface-variant': '#F8FAFF',
          'on-surface-variant': '#64748B'
        }
      }
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)


app.mount('#app')