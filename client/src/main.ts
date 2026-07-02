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
import './utils/density'
import './utils/textZoom'

const savedTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'

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
    defaultTheme: savedTheme,
    themes: {
      light: {
        dark: false,
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
      },
      dark: {
        dark: true,
        colors: {
          primary: '#3B82F6',
          secondary: '#94A3B8',
          accent: '#3B82F6',
          error: '#F87171',
          warning: '#FBBF24',
          info: '#22D3EE',
          success: '#34D399',
          surface: '#1E293B',
          background: '#0F172A',
          'on-surface': '#F1F5F9',
          'on-primary': '#ffffff',
          'surface-variant': '#334155',
          'on-surface-variant': '#CBD5E1'
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