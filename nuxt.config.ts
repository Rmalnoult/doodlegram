// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sentry/nuxt/module',
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  sentry: {
    sourceMapsUploadOptions: {
      org: 'romain-malnoult',
      project: 'doodlegram',
    },
    enabled: process.env.NODE_ENV === 'production',
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // DeepSeek serves both wire formats, so both clients stay and only the
    // endpoint, key and model change. See server/utils/{claude,openai}.ts.
    aiApiKey: process.env.DEEPSEEK_API_KEY || '',
    aiAnthropicBaseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/anthropic',
    aiOpenAiBaseUrl: process.env.AI_OPENAI_BASE_URL || 'https://api.deepseek.com',
    aiModel: process.env.AI_MODEL || 'deepseek-flash',
    falKey: process.env.FAL_KEY,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
    }
  },

  app: {
    head: {
      title: 'Doodlegram — AI-Powered Educational Diagrams',
      meta: [
        { name: 'description', content: 'Generate hand-drawn educational diagrams from simple text prompts. Built for educators.' },
        { property: 'og:image', content: '/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/og-image.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://doodlegram.app' }
      ]
    }
  },

  vite: {
    resolve: {
      conditions: ['production']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client']
    },
    ssr: {
      noExternal: ['veaury']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
