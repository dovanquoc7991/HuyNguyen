import { is } from "drizzle-orm";

/* User interface */
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    created_at: string;
    updated_at: string;
}

/* Stat interface */
export interface Stat {
    id: number;
    user_id: number;
    latest_reading_score: string;
    latest_listening_score: string;
    total_listening_completed: number;
    total_reading_completed: number;
    best_reading_score: string;
    best_listening_score: string;
    average_reading_score: string;
    average_listening_score: string;
    created_at: string;
    updated_at: string;
}

export interface Test {
  id: number;
  description: string;
  parts: number;
}

export interface TestList {
  exams: Test[];
}

export interface Part {
  id: number;
  exam_id: number; 
  title: string;
  time: string;
  questions_count: number;
  part_number: number;
  locked: boolean;
  isBasic: boolean;
  password: string;
  examContent: string;
  created_at: string;
}

export interface PartList {
  sections: Part[];
}