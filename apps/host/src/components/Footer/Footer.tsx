import { Link } from "react-router";
import styles from "./Footer.module.css";

const SECTIONS = [
  {
    title: "Tienda",
    links: [
      { to: "/catalog", label: "Catálogo" },
      { to: "/catalog/frutas-frescas", label: "Frutas frescas" },
      { to: "/catalog/verdura-organica", label: "Verduras orgánicas" },
      { to: "/cart", label: "Carrito" },
    ],
  },
  {
    title: "HuertoHogar",
    links: [
      { to: "/about", label: "Nosotros" },
      { to: "/blog", label: "Blog" },
      { to: "/login", label: "Iniciar sesión" },
      { to: "/register", label: "Crear cuenta" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.about}>
          <p className={styles.brand}>HuertoHogar</p>
          <p className={styles.tagline}>
            Frutas, verduras y productos orgánicos del campo chileno, directo a
            tu mesa desde 2019.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h2 className={styles.heading}>{section.title}</h2>
            <ul className={styles.list}>
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className={styles.heading}>Contacto</h2>
          <address className={styles.list}>
            <span>Av. Los Aromos 1450, Santiago</span>
            <a href="tel:+56223456789" className={styles.link}>
              +56 2 2345 6789
            </a>
            <a href="mailto:contacto@huertohogar.cl" className={styles.link}>
              contacto@huertohogar.cl
            </a>
            <span>Lun a Sáb · 8:00 – 19:00</span>
          </address>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} HuertoHogar SpA. Todos los derechos reservados.</p>
        <p>Envíos a todo Chile · Pago seguro</p>
      </div>
    </footer>
  );
}
