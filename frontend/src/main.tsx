import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromChildren,
  Route,
} from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import RegisterPage from "./page/RegisterPage.tsx";
import LoginPage from "./page/LoginPage.tsx";
import MainPage from "./page/MainPage.tsx";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <>
      <Route path="" element={<App />}>
        <Route path="main" element={<MainPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
