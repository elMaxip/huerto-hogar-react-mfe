export const Role = {
  Admin: "admin",
  Client: "client",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  role: Role;
}

export type NewUser = Omit<User, "id">;

export type SessionUser = Omit<User, "password">;

/** Los usuarios creados antes de existir los roles no tienen `role` guardado */
export function normalizeRole(role: unknown): Role {
  return role === Role.Admin ? Role.Admin : Role.Client;
}

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === Role.Admin;
}
