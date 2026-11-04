import { pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { students } from '../students/students.schema';
import { courses } from '../courses/courses.schema';   

export const enrollments = pgTable(
  'enrollments',
  {
    studentRa: integer('student_ra')
      .notNull()
      .references(() => students.ra, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
      }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
      }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Define a Chave Primária Composta (PRIMARY KEY (student_ra, course_id))
    primaryKey({ columns: [table.studentRa, table.courseId] }),
  ],
);
