#!/usr/bin/env node
// Cross-platform dev orchestrator: PGlite + migrations + Next.js + Spotlight.
//
// It replaces `run-p db-server:file dev:*`, which breaks on Windows:
// cmd.exe strips single quotes from `--run 'npm run db:migrate'` and
// pglite-server's internal `spawn('npm')` cannot find `npm.cmd` there.
//
// Environment variables:
//   PORT                port for the Next.js dev server (default: 3000)
//   SPOTLIGHT_DISABLED  set to "true" to skip Sentry Spotlight (e.g. for E2E)
import { spawn } from 'node:child_process';
import net from 'node:net';

const port = process.env.PORT ?? '3000';
const spotlightDisabled = process.env.SPOTLIGHT_DISABLED === 'true';

const waitForPort = (port, host, timeoutMs = 30_000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const tryOnce = () => {
      const socket = net.connect({ port, host });
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
        } else {
          setTimeout(tryOnce, 300);
        }
      });
    };
    tryOnce();
  });

const run = command =>
  spawn(command, { shell: true, stdio: 'inherit' });

const pglite = run('npx pglite-server -m 100 --db=local.db');

let next;

try {
  await waitForPort(5432, '127.0.0.1');
  console.log('[dev] PGlite is up, applying migrations…');

  await new Promise((resolve, reject) => {
    const migrate = run('npx dotenv -c -- drizzle-kit migrate');
    migrate.once('exit', code => (code === 0 ? resolve() : reject(new Error(`migrations failed (exit ${code})`))));
    migrate.once('error', reject);
  });

  console.log(`[dev] Migrations applied, starting Next.js on port ${port}…`);
  if (!spotlightDisabled) {
    run('npx @spotlightjs/spotlight');
  }
  next = run(`npx next dev -p ${port}`);
  next.once('exit', () => process.exit(0));
} catch (error) {
  console.error(`[dev] ${error.message}`);
  pglite.kill();
  process.exit(1);
}

const shutdown = () => {
  pglite.kill();
  next?.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
