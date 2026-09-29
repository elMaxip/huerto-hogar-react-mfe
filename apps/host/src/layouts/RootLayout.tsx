import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./RootLayout.module.css";

export default function RootLayout() {
  // Mientras llega el código del remoto y sus datos, la página actual sigue visible
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  return (
    <div className={styles.layout}>
      <div className={styles.progress} data-active={loading} aria-hidden />
      <Navbar />
      <main className={styles.main} aria-busy={loading}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
