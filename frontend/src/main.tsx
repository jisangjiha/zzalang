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
import Test from "./mainpage/Test.tsx";
import RegisterPage from "./page/RegisterPage.tsx";
import LoginPage from "./page/LoginPage.tsx";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <>
      <Route path="" element={<App />} />
      <Route path="test" element={<Test />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="login" element={<LoginPage />} />
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
