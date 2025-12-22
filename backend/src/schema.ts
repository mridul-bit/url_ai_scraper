import { pgTable,integer, text, varchar } from 'drizzle-orm/pg-core';


//https://orm.drizzle.team/docs/get-started/postgresql-new
export const tasks = pgTable('tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text('url').notNull(),
  question: text('question').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  answer: text('answer'),
});

