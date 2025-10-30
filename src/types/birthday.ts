// src/types/birthday.ts
export type Birthday =
  | { month: number; day: number; year?: number }     // preferred (partial OK)
  | { isoDate: string };                               // "YYYY-MM-DD" (full only)
