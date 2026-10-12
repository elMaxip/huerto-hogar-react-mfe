import { data, redirect } from "react-router";
import {
  getSession,
  getUserById,
  isAdmin,
  type SessionUser,
} from "@huerto/shared";

export async function requireAdmin({
  request,
}: {
  request: Request;
}): Promise<SessionUser> {
  const session = getSession();

  if (!session) {
    const { pathname } = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  const user = await getUserById(session.id);

  if (!user || user.email !== session.email || !isAdmin(user)) {
    throw data("Solo los administradores pueden entrar a esta sección", {
      status: 403,
    });
  }

  return session;
}
