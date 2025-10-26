import { is } from "drizzle-orm";
import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Question schemas
const fillBlanksQuestionSchema = z.object({
  number: z.number(),
  type: z.literal("FILL_BLANKS"),
  answer: z.array(z.string()),
});

const tfngQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  answer: z.enum(["TRUE", "FALSE", "NOT GIVEN"]),
});

const multiQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  type: z.literal("MULTI"),
  answer: z.array(z.string()),
});

const mcqQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  type: z.literal("MCQ"),
  answer: z.string(),
});

const matchTableQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  answer: z.string(),
  type: z.literal("MATCH_TABLE"),
});

const dragDropQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  answer: z.string(),
});

const matchingHeaderQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  answer: z.string(),
  type: z.literal("MATCHING_HEADER"),
});

// Question group schemas
const fillBlanksGroupSchema = z.object({
  type: z.literal("FILL_BLANKS"),
  instruction: z.string(),
  paragraph: z.string(),
  imgContent: z.string().optional(),
  questions: z.array(fillBlanksQuestionSchema),
});

const tfngGroupSchema = z.object({
  type: z.literal("TFNG"),
  instruction: z.string(),
  questions: z.array(tfngQuestionSchema),
});

const multiGroupSchema = z.object({
  type: z.literal("MULTI"),
  instruction: z.string(),
  questions: z.array(multiQuestionSchema),
});

const mcqGroupSchema = z.object({
  type: z.literal("MCQ"),
  instruction: z.string(),
  questions: z.array(mcqQuestionSchema),
});

const matchTableGroupSchema = z.object({
  type: z.literal("MATCH_TABLE"),
  instruction: z.string(),
  choices: z.array(z.string()),
  paragraph: z.string().optional(),
  imgContent: z.string().optional(),
  questions: z.array(matchTableQuestionSchema),
});

const dragDropGroupSchema = z.object({
  
  type: z.literal("DRAG_DROP"),
  instruction: z.string(),
  choices: z.array(z.string()),
  paragraph: z.string(),
  imgContent: z.string().optional(),
  questions: z.array(dragDropQuestionSchema),
});

const matchingHeaderGroupSchema = z.object({
  type: z.literal("MATCHING_HEADER"),
  instruction: z.string(),
  choices: z.array(z.string()),
  imgContent: z.string().optional(),
  paragraph: z.string().optional(), // For optional image/diagram
  questions: z.array(matchingHeaderQuestionSchema),
});

const dropdownQuestionSchema = z.object({
  number: z.number(),
  question: z.string(),
  type: z.literal("DROPDOWN"),
  answer: z.string(),
});

const dropdownGroupSchema = z.object({
  type: z.literal("DROPDOWN"),
  instruction: z.string(),
  paragraph: z.string().optional(),
  choices: z.array(z.string()),
  questions: z.array(z.object({
    number: z.number(),
    type: z.literal("DROPDOWN"),
    question: z.string(),
    answer: z.string(),
  })),
});


const questionGroupSchema = z.union([
  fillBlanksGroupSchema,
  tfngGroupSchema,
  multiGroupSchema,
  mcqGroupSchema,
  matchTableGroupSchema,
  dragDropGroupSchema,
  matchingHeaderGroupSchema,
  dropdownGroupSchema, 
]);

// Test part schema
const testPartSchema = z.object({
  id: z.string(),
  title: z.string(),
  time: z.string(),
  passage: z.array(z.string()),
  groups: z.array(questionGroupSchema),
});

// Full test schema
export const testDataSchema = z.object({
  Detailedtest: z.object({
    reading: z.object({
      part1: z.array(testPartSchema).optional(),
      part2: z.array(testPartSchema).optional(),
      part3: z.array(testPartSchema).optional(),
    }),
    listening: z.object({}).optional(),
  }),
});

// Database tables
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").notNull(),
  locked: integer("locked").notNull().default(0),
  isBasic: integer("isBasic").notNull().default(0),
  audio_url: text("audio_url").notNull().default(""),
  password: text("password").notNull().default(""),
  explanation: text("explanation").notNull().default(""),
  title: text("title").notNull(),
  time: integer("time").notNull(),
  test_type: text("test_type").notNull().default("single_part"), // "single_part" or "full_test"
  part_number: integer("part_number").default(1), // 1, 2, or 3 for reading parts
  passage: text("passage").array().notNull(),
  groups: json("groups").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  examContent: text("explanation").notNull().default(""),
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;
export type TestData = z.infer<typeof testDataSchema>;
export type QuestionGroup = z.infer<typeof questionGroupSchema>;

// Individual question type exports
export type FillBlanksGroup = z.infer<typeof fillBlanksGroupSchema>;
export type TFNGGroup = z.infer<typeof tfngGroupSchema>;
export type MultiGroup = z.infer<typeof multiGroupSchema>;
export type MCQGroup = z.infer<typeof mcqGroupSchema>;
export type MatchTableGroup = z.infer<typeof matchTableGroupSchema>;
export type DragDropGroup = z.infer<typeof dragDropGroupSchema>;
export type MatchingHeaderGroup = z.infer<typeof matchingHeaderGroupSchema>;
export type DropdownGroup = z.infer<typeof dropdownGroupSchema>;
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
