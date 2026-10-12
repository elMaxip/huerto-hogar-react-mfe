import { data, redirect } from "react-router";
import { getSession, getUserById, isAdmin, type SessionUser } from "@huerto/shared";

/**
 * Protege las rutas del panel. React Router ejecuta los loaders de una ruta
 * anidada en paralelo, por eso cada loader y action lo llama por su cuenta.
 *
 * El rol se vuelve a leer desde la base de datos: la sesión vive en
 * localStorage y se puede editar a mano.
 */
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
