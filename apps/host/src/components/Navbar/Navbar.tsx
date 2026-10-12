import { NavLink } from "react-router";
import { isAdmin, useSession } from "@huerto/shared";
import styles from "./Navbar.module.css";
import SessionMenu from "../SessionMenu/SessionMenu";

const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/catalog", label: "Catálogo" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "Nosotros" },
];

export default function Navbar() {
  const session = useSession();

  return (
    <nav className={styles.nav}>
      <div className={styles.group}>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={styles.link}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <h1 className={styles.brand}>HuertoHogar</h1>

      <div className={styles.group}>
        {isAdmin(session) && (
          <NavLink to="/admin" className={styles.link}>
            Administración
          </NavLink>
        )}
        <NavLink to="/cart" className={styles.link}>
          Carrito
        </NavLink>
        <SessionMenu />
      </div>
    </nav>
  );
}
