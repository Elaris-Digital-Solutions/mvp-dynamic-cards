// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://44359fc7cb55474a5bc5d70737e4d633@o4511260033744896.ingest.us.sentry.io/4511260035252224",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  enableLogs: true,

  // false: no enviar email/IP del usuario a Sentry (GDPR)
  sendDefaultPii: false,
});
