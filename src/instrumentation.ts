import * as Sentry from '@sentry/nextjs';
import { Env } from './libs/Env';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  // Sentry DSN
  dsn: Env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable Spotlight in development
  spotlight: process.env.NODE_ENV === 'development',

  integrations: [
    Sentry.consoleLoggingIntegration(),
  ],

  // Privacy: sending IPs and request headers to a third party must be an
  // explicit opt-in, not a template default.
  sendDefaultPii: false,

  // Sample 10% of transactions by default; raise it locally while debugging.
  tracesSampleRate: Env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
};

export function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Node.js Sentry configuration
      Sentry.init(sentryOptions);
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      // Edge Sentry configuration
      Sentry.init(sentryOptions);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
