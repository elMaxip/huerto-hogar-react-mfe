export interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
}

export type NewUser = Omit<User, "id">;

/** Lo que se guarda de la sesión: nunca la contraseña */
export type SessionUser = Omit<User, "password">;
