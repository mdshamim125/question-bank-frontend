// src/types/index.ts  (or src/types/question.ts)

export interface IOption {
  id: number;
  text: string;
  objectiveQuestionId: number;
}

export interface IObjective {
  id: number;
  questionText: string;
  questionMark: number;
  questionId: number;
  answerOptionId: number;
  options: IOption[];
}

export interface IAnahote {
  id: number;
  questionText: string;
  questionMark: number;
  questionId: number;
}

export interface ISubQuestion {
  id: number;
  srijonshilQuestionId: number;
  questionText: string;
  questionMark: number;
  hint: string | null;
}

export interface ISrijonshil {
  id: number;
  prompt: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionId: number;
  subQuestions: ISubQuestion[];
}

export interface IClass {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubject {
  id: number;
  name: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IChapter {
  id: number;
  name: string;
  classId: number;
  subjectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string; // usually not needed in frontend
  role: "SUPERADMIN" | "ADMIN" | "TEACHER";
  createdAt: string;
  updatedAt: string;
}

export interface IQuestion {
  id: number;
  type: "OBJECTIVE" | "ANAHOTE" | "SRIJONSHIL";
  subjectId: number;
  chapterId?: number;
  classId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;

  objective: IObjective | null;
  anahote: IAnahote | null;
  srijonshil: ISrijonshil | null;

  class: IClass;
  subject: ISubject;
  chapter?: IChapter;
  createdBy: IUser;
}

export interface IQuestionPaper {
  id: number;
  title: string;
  fileUrl: string;
  fileType: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  questions?: IQuestion[];
  createdAt: string;
}
