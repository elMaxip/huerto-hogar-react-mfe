import type { SessionUser, User } from "../models/user";
import { createStorageChannel } from "./storage";

/** Se dispara en window al iniciar o cerrar sesión */
export const SESSION_CHANGE_EVENT = "session:change";

export const sessionChannel = createStorageChannel("user", SESSION_CHANGE_EVENT);

export function parseSession(saved: string | null): SessionUser | null {
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);

    if (typeof parsed?.fullname !== "string" || typeof parsed?.email !== "string") {
      return null;
    }

    return { id: parsed.id, fullname: parsed.fullname, email: parsed.email };
  } catch {
    return null;
  }
}

export function login(user: User) {
  const session: SessionUser = {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
  };

  sessionChannel.write(JSON.stringify(session));
}

export function logout() {
  sessionChannel.write(null);
}
