import { useTransition } from "react";
import { Link, useNavigate } from "react-router";
import {
  getUser,
  MIN_FULLNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  register as registerUser,
  Role,
} from "@huerto/shared";
import { InputLabel, PrimaryButton } from "@huerto/shared/ui";
import styles from "../auth.module.css";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  fullname: z
    .string()
    .min(
      MIN_FULLNAME_LENGTH,
      `El nombre completo debe tener al menos ${MIN_FULLNAME_LENGTH} caracteres`,
    ),
  email: z.email("El correo es inválido"),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    ),
  confirmedPassword: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    ),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
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
    if (data.password != data.confirmedPassword) {
      setError("confirmedPassword", {
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    startTransition(async () => {
      if (await getUser(data.email)) {
        setError("email", {
          message: "Ya existe una cuenta con este correo electrónico",
        });
        return;
      }

      try {
        await registerUser({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          role: Role.Client,
        });
      } catch {
        setError("email", {
          message: "No se pudo crear la cuenta, intenta nuevamente",
        });
        return;
      }

      await navigate("/login");
    });
  }

  return (
    <section className={styles.page}>
      <title>Registrar cuenta</title>

      <div className={styles.card}>
        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.inputs}>
            <InputLabel
              label="Nombre completo"
              maxLength={80}
              autoComplete="name"
              {...register("fullname")}
              error={errors.fullname?.message}
            />
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
              autoComplete="new-password"
              {...register("password")}
              error={errors.password?.message}
            />
            <InputLabel
              label="Confirma tu contraseña"
              type="password"
              autoComplete="new-password"
              {...register("confirmedPassword")}
              error={errors.confirmedPassword?.message}
            />
          </div>

          <PrimaryButton type="submit" disabled={isPending}>
            {isPending ? "Creando cuenta…" : "Crear cuenta"}
          </PrimaryButton>

          <Link to="/login" className={styles.link}>
            ¿Tienes una cuenta?
          </Link>
        </form>
      </div>
    </section>
  );
}
