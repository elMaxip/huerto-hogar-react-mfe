import { useState, useTransition, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  getUser,
  isValidEmail,
  MIN_FULLNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  register,
} from "@huerto/shared";
import { InputLabel, PrimaryButton } from "@huerto/shared/ui";
import styles from "../auth.module.css";

type Field = "fullname" | "email" | "password" | "confirmedPassword";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

function validate({ fullname, email, password, confirmedPassword }: Values): Errors {
  const found: Errors = {};

  if (!fullname) {
    found.fullname = "Ingresa tu nombre completo";
  } else if (fullname.length < MIN_FULLNAME_LENGTH) {
    found.fullname = `El nombre debe tener al menos ${MIN_FULLNAME_LENGTH} caracteres`;
  }

  if (!email) {
    found.email = "Ingresa tu correo electrónico";
  } else if (!isValidEmail(email)) {
    found.email = "Ingresa un correo electrónico válido";
  }

  if (!password) {
    found.password = "Ingresa una contraseña";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    found.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }

  if (!confirmedPassword) {
    found.confirmedPassword = "Repite tu contraseña";
  } else if (password !== confirmedPassword) {
    found.confirmedPassword = "Las contraseñas no coinciden";
  }

  return found;
}

export default function Register() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<Values>({
    fullname: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned: Values = {
      ...values,
      fullname: values.fullname.trim(),
      email: values.email.trim(),
    };

    const found = validate(cleaned);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      if (await getUser(cleaned.email)) {
        setErrors({ email: "Ya existe una cuenta con este correo electrónico" });
        return;
      }

      try {
        await register({
          fullname: cleaned.fullname,
          email: cleaned.email,
          password: cleaned.password,
        });
      } catch {
        // El índice email_idx es único: otra pestaña pudo registrar el correo
        setErrors({ email: "No se pudo crear la cuenta, intenta nuevamente" });
        return;
      }

      await navigate("/login");
    });
  }

  return (
    <section className={styles.page}>
      <title>Registrar cuenta</title>

      <div className={styles.card}>
        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <div className={styles.inputs}>
            <InputLabel
              label="Nombre completo"
              name="fullname"
              maxLength={80}
              autoComplete="name"
              value={values.fullname}
              error={errors.fullname}
              onChange={(event) => update("fullname", event.target.value)}
            />
            <InputLabel
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(event) => update("email", event.target.value)}
            />
            <InputLabel
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              error={errors.password}
              onChange={(event) => update("password", event.target.value)}
            />
            <InputLabel
              label="Confirma tu contraseña"
              name="confirmed-password"
              type="password"
              autoComplete="new-password"
              value={values.confirmedPassword}
              error={errors.confirmedPassword}
              onChange={(event) =>
                update("confirmedPassword", event.target.value)
              }
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
