import { Outlet } from "react-router-dom";
import "./App.css";
import Footer from "./fixed/Footer";
import Header from "./fixed/Header";

function App() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default App;
