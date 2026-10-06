import { Outlet, useNavigation } from "react-router";
import styles from "./RootLayout.module.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function RootLayout() {
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  return (
    <div className={styles.layout}>
      <div className={styles.progress} data-active={loading} aria-hidden></div>
      <Navbar />
      <main className={styles.main} aria-busy={loading}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
