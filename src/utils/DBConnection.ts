import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import * as schema from '@/models/Schema';

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate
export const createDbConnection = () => {
  // Detect managed Postgres providers that require TLS (Neon, Supabase, …)
  const requiresSsl = /\.(?:neon\.tech|supabase\.co|render\.com)(?::|$)/.test(
    Env.DATABASE_URL,
  );

  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    // Keep pools small: serverless platforms run many concurrent instances
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 5_000,
    ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  pool.on('error', (error) => {
    logger.error(`Database pool error: ${error.message}`);
  });

  return drizzle({
    client: pool,
    schema,
  });
};
