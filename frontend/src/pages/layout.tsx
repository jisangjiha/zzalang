import { Outlet } from "react-router-dom";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./layout.module.css";

function App() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer
        position="top-center"
        aria-label="ToastContainer"
        theme="colored"
        autoClose={3000}
      />
    </>
  );
}

export default App;
