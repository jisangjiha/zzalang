import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromChildren,
  Route,
} from "react-router-dom";

import Layout from "./pages/layout.tsx";
import RegisterPage from "./pages/register/page.tsx";
import LoginPage from "./pages/login/page.tsx";
import MainPage from "./pages/page.tsx";
import MyPage from "./pages/mypage/page.tsx";

import "./index.css";
import { AuthProvider } from "./contexts/auth.tsx";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<Layout />}>
      <Route index element={<MainPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="mypage" element={<MyPage />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
