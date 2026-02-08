export interface ITeacherAssignment {
  id: number;
  teacherId: number;
  subjectId: number;
  classId: number;
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
  class: IClass;
  teachers: ITeacherAssignment[];
}
