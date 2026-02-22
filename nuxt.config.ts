// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sentry/nuxt/module',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
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
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    falKey: process.env.FAL_KEY,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
    }
  },

  supabase: {
    redirect: false
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
    plugins: [
      // Fix CJS interop: cookie@1.x is CJS-only but @supabase/ssr imports it as ESM.
      // When Vite serves via @fs/, CJS modules get no ESM wrapping.
      // This plugin converts cookie's CJS to ESM by stripping CJS boilerplate.
      {
        name: 'fix-cookie-esm',
        transform(code, id) {
          if (id.includes('node_modules/cookie/dist/index.js')) {
            return code
              .replace('"use strict";', '')
              .replace(/Object\.defineProperty\(exports.*?\);/s, '')
              .replace(/^exports\.\w+\s*=\s*\w+;$/gm, '')
              + '\nexport { parseCookie, parseCookie as parse, stringifyCookie, stringifySetCookie, stringifySetCookie as serialize, parseSetCookie };\n'
          }
        }
      }
    ],
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
