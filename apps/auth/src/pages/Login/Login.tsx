import { useState, useTransition, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { getUser, isValidEmail, login } from "@huerto/shared";
import { InputLabel, PrimaryButton } from "@huerto/shared/ui";
import styles from "../auth.module.css";

type Field = "email" | "password";
type Errors = Partial<Record<Field, string>>;

export default function Login() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<Record<Field, string>>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Al corregir el campo el mensaje deja de tener sentido
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(email: string, password: string): Errors {
    const found: Errors = {};

    if (!email) {
      found.email = "Ingresa tu correo electrónico";
    } else if (!isValidEmail(email)) {
      found.email = "Ingresa un correo electrónico válido";
    }

    if (!password) found.password = "Ingresa tu contraseña";

    return found;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = values.email.trim();
    const password = values.password;

    const found = validate(email, password);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      const user = await getUser(email);

      if (!user) {
        setErrors({ email: "No existe una cuenta con este correo electrónico" });
        return;
      }

      if (user.password !== password) {
        setErrors({ password: "La contraseña es incorrecta" });
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
        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <div className={styles.inputs}>
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
              autoComplete="current-password"
              value={values.password}
              error={errors.password}
              onChange={(event) => update("password", event.target.value)}
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
