import * as Sentry from '@sentry/nuxt'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
}
