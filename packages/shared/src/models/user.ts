export interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
}

export type NewUser = Omit<User, "id">;

export type SessionUser = Omit<User, "password">;
