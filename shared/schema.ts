import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  streak: integer("streak").notNull().default(0),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'reading' or 'listening'
  category: text("category").notNull(), // 'academic' or 'general'
  duration: integer("duration").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  content: jsonb("content").notNull(), // test content and questions
  isActive: boolean("is_active").notNull().default(true),
});

export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  score: integer("score"), // band score * 10 (e.g., 75 for 7.5)
  answers: jsonb("answers"), // user answers
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in minutes
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'reading' or 'listening'
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'missed'
  testId: integer("test_id"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillType: text("skill_type").notNull(), // 'reading' or 'listening'
  averageScore: integer("average_score").notNull().default(0), // band score * 10
  totalTests: integer("total_tests").notNull().default(0),
  bestScore: integer("best_score").notNull().default(0),
  lastTestDate: timestamp("last_test_date"),
  progressPercentage: integer("progress_percentage").notNull().default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  startedAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
