import { 
  pgTable, 
  uuid, 
  text, 
  boolean, 
  timestamp, 
  smallint, 
  char, 
  pgEnum, 
  bigint, 
  date, 
  integer, 
  jsonb, 
  inet, 
  bigserial,
  uniqueIndex,
  index,
  primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const txnDirectionEnum = pgEnum('txn_direction', ['credit', 'debit']);
export const planTierEnum = pgEnum('plan_tier', ['free', 'pro']);
export const subStatusEnum = pgEnum('sub_status', ['active', 'past_due', 'canceled', 'trialing']);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // references auth.users(id)
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  defaultCurrency: char('default_currency', { length: 3 }).notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  plan: planTierEnum('plan').notNull().default('free'),
  notifyDaily: boolean('notify_daily').notNull().default(false),
  notifyHour: smallint('notify_hour').notNull().default(21),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // references auth.users(id)
  name: text('name').notNull(),
  icon: text('icon').notNull().default('tag'),
  direction: txnDirectionEnum('direction'),
  isSystem: boolean('is_system').notNull().default(false),
  sortOrder: smallint('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unqUserIdName: uniqueIndex('categories_user_id_name_unq').on(t.userId, t.name),
  idxCategoriesUser: index('idx_categories_user').on(t.userId, t.sortOrder),
}));

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // references auth.users(id)
  name: text('name').notNull(),
  kind: text('kind').notNull().default('cash'),
  currencyCode: char('currency_code', { length: 3 }).notNull().default('INR'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unqUserIdName: uniqueIndex('accounts_user_id_name_unq').on(t.userId, t.name),
}));

export const recurringRules = pgTable('recurring_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // references auth.users(id)
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  direction: txnDirectionEnum('direction').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  currencyCode: char('currency_code', { length: 3 }).notNull().default('INR'),
  note: text('note'),
  rrule: text('rrule').notNull(),
  startsOn: date('starts_on').notNull(),
  endsOn: date('ends_on'),
  lastRunOn: date('last_run_on'),
  isPaused: boolean('is_paused').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  idxRecurringDue: index('idx_recurring_due').on(t.lastRunOn).where(sql`is_paused = false`),
}));

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // references auth.users(id)
  clientId: uuid('client_id').notNull(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  direction: txnDirectionEnum('direction').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  currencyCode: char('currency_code', { length: 3 }).notNull().default('INR'),
  signedMinor: bigint('signed_minor', { mode: 'bigint' }).generatedAlwaysAs(
    sql`case when direction = 'credit' then amount_minor else -amount_minor end`
  ),
  occurredOn: date('occurred_on').notNull(),
  note: text('note'),
  recurringId: uuid('recurring_id').references(() => recurringRules.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  uqTxnClient: uniqueIndex('uq_txn_client').on(t.userId, t.clientId),
  idxTxnList: index('idx_txn_list').on(t.userId, t.occurredOn, t.id).where(sql`deleted_at is null`),
  idxTxnCategory: index('idx_txn_category').on(t.userId, t.categoryId, t.occurredOn).where(sql`deleted_at is null`),
  idxTxnSync: index('idx_txn_sync').on(t.userId, t.updatedAt),
  idxTxnAccount: index('idx_txn_account').on(t.userId, t.accountId, t.occurredOn).where(sql`deleted_at is null`),
}));

export const dailyRollups = pgTable('daily_rollups', {
  userId: uuid('user_id').notNull(),
  day: date('day').notNull(),
  currencyCode: char('currency_code', { length: 3 }).notNull(),
  creditMinor: bigint('credit_minor', { mode: 'bigint' }).notNull().default(BigInt(0)),
  debitMinor: bigint('debit_minor', { mode: 'bigint' }).notNull().default(BigInt(0)),
  netMinor: bigint('net_minor', { mode: 'bigint' }).generatedAlwaysAs(sql`credit_minor - debit_minor`),
  txnCount: integer('txn_count').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.day, t.currencyCode] }),
}));

export const userBalances = pgTable('user_balances', {
  userId: uuid('user_id').notNull(),
  currencyCode: char('currency_code', { length: 3 }).notNull(),
  balanceMinor: bigint('balance_minor', { mode: 'bigint' }).notNull().default(BigInt(0)),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.currencyCode] }),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // references auth.users(id)
  provider: text('provider').notNull(),
  providerCustomerId: text('provider_customer_id').notNull(),
  providerSubId: text('provider_sub_id').notNull().unique(),
  plan: planTierEnum('plan').notNull(),
  status: subStatusEnum('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: uuid('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  ip: inet('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  idxAuditUser: index('idx_audit_user').on(t.userId, t.createdAt),
}));
