// src/type/index.ts
export interface IQuestionHeader {
  id: number;
  schoolName: string;
  location: string;
  className: string;
  subject: string;
  examType: string;
  duration: string;
  fullMark: number;
  remark?: string;
}

