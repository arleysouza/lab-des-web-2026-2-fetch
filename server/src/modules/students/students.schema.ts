import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  ra: integer('ra').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
});
