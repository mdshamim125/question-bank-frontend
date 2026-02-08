export interface ISubject {
  id: number;
  name: string;
  classId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ITeacher {
  id: number;
  name?: string; // add more fields if your teacher object has them
  email?: string;
  // add other teacher properties if needed
}

export interface IClass {
  id: number;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  subjects: ISubject[];
  teachers: ITeacher[];
}




