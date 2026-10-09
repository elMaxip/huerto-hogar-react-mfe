import { useTransition } from "react";
import { Link, useNavigate } from "react-router";
import {
  getUser,
  login,
  MIN_PASSWORD_LENGTH,
} from "@huerto/shared";
import { InputLabel, PrimaryButton } from "@huerto/shared/ui";
import styles from "../auth.module.css";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.email("Correo electrónico no válido"),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    ),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormData) {
    const email = data.email.trim();
    const password = data.password;

    startTransition(async () => {
      const user = await getUser(email);

      if (!user) {
        setError("email", {
          type: "notFound",
          message: "No existe una cuenta con este correo electrónico",
        });
        return;
      }

      if (user.password != password) {
        setError("password", {
          type: "error",
          message: "Las contraseñas no coinciden",
        });
        return;
      }

      login(user);
      await navigate("/");
    });
  }

  return (
    <section className={styles.page}>
      <title>Iniciar sesión</title>

      <div className={styles.card}>
        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.inputs}>
            <InputLabel
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <InputLabel
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <PrimaryButton type="submit" disabled={isPending}>
            {isPending ? "Ingresando…" : "Iniciar sesión"}
          </PrimaryButton>

          <Link to="/register" className={styles.link}>
            ¿No tienes cuenta?
          </Link>
        </form>
      </div>
    </section>
  );
}
