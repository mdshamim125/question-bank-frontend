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
  class?: IClass;      // optional because sometimes backend might not populate
  subject?: ISubject;  // optional for safety
}
