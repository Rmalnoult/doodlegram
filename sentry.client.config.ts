import * as Sentry from '@sentry/nuxt'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.NUXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}
