import { NavLink } from "react-router";
import { useCartCount } from "@huerto/shared";
import SessionMenu from "../SessionMenu/SessionMenu";
import styles from "./Navbar.module.css";

const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/catalog", label: "Catálogo" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "Nosotros" },
];

export default function Navbar() {
  const cartCount = useCartCount();

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
        <NavLink to="/cart" className={styles.link}>
          Carrito
          {cartCount > 0 && (
            <span className={styles.cartCount}>{cartCount}</span>
          )}
        </NavLink>
        <SessionMenu />
      </div>
    </nav>
  );
}
