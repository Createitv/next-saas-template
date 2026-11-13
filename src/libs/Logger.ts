import type { AsyncSink } from '@logtape/logtape';
import { configure, fromAsyncSink, getConsoleSink, getJsonLinesFormatter, getLogger } from '@logtape/logtape';
import { Env } from './Env';

const betterStackSink: AsyncSink = async (record) => {
  await fetch(`https://${Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`,
    },
    body: JSON.stringify(record),
    // Never let a log shipper hang the request path
    signal: AbortSignal.timeout(3000),
  }).catch((error: unknown) => {
    // Sink errors must never break the app; log to console as last resort
    console.error(`Better Stack logging failed: ${error instanceof Error ? error.message : String(error)}`);
  });
};

const canForwardToBetterStack = Boolean(Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN) && Boolean(Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST);

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
    {
      category: ['app'],
      sinks: canForwardToBetterStack ? ['console', 'betterStack'] : ['console'],
      lowestLevel: Env.NEXT_PUBLIC_LOGGING_LEVEL,
    },
  ],
});

export const logger = getLogger(['app']);
