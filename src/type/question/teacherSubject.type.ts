// Teacher
export interface ITeacher {
  id: number;
  name: string;
  email: string;
  role: "TEACHER" | "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

// Class
export interface IClass {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Subject
export interface ISubject {
  id: number;
  name: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class?: IClass;
}

// Teacher Subject Assignment
export interface ITeacherSubjectAssignment {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  classId: number;

  teacher?: ITeacher;
  subject?: ISubject;
  class?: IClass;

  createdAt?: string;
  updatedAt?: string;
}
