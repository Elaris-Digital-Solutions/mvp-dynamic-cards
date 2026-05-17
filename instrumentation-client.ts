// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  enableLogs: true,

  sendDefaultPii: false,

  allowUrls: [
    /https:\/\/veltrixnfc\.com/,
    /http:\/\/localhost/,
  ],

  beforeSend(event) {
    if (event.request?.url?.includes('/admin')) return null
    return event
  },

  tracesSampler(samplingContext) {
    const name = samplingContext.name ?? ''
    if (name.includes('/admin')) return 0
    return 0.1
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
