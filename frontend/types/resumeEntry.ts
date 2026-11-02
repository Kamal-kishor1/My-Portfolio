export type ResumeType = "experience" | "education" | "skill";

export interface ResumeEntry {
  id: number;
  type: ResumeType;
  title: string;
  organization: string | null;
  description: string | null;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // null = ongoing
  sort_order: number;
}

export interface ResumeEntryInput {
  type: ResumeType;
  title: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

export const EMPTY_RESUME_INPUT: ResumeEntryInput = {
  type: "experience",
  title: "",
  organization: null,
  description: null,
  start_date: null,
  end_date: null,
  sort_order: 0,
};
