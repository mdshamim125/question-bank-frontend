export type UserRole = "ADMIN" | "TEACHER" | "SUPERADMIN";

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
