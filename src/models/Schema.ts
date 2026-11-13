import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.
//
// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`
// 3. Apply it with `npm run db:migrate` (local) or `npm run db:migrate:deploy` (production).
//
// Multi-tenancy rules (important):
// 1. `orgId` is the tenant key. It MUST come from `requireOrg()` in
//    `src/libs/Authz.ts` (the Clerk organization id of the signed-in user).
// 2. Every tenant-owned table gets an `orgId` column and an index on it.
// 3. Every query must be scoped: `.where(eq(table.orgId, orgId))`.
// 4. Unique constraints must include `orgId`, so two tenants can safely
//    use the same natural key (e.g. the same title).
// 5. Prefer UUID primary keys: safe to expose in URLs, no cross-tenant
//    enumeration through sequential ids.

export const todoSchema = pgTable('todo', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Tenant key: the Clerk organization id from `requireOrg()`
  orgId: text('org_id').notNull(),
  // Creator: the Clerk user id from `requireOrg()`
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, table => [
  // Fast tenant-scoped lookups
  index('todo_org_idx').on(table.orgId),
  // Natural keys are unique per tenant, not globally
  unique('todo_org_owner_title_key').on(table.orgId, table.ownerId, table.title),
]);
