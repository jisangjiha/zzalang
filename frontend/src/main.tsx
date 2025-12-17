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
import PostsPage from "./pages/posts/page.tsx";
import PostedPage from "./pages/postsId/page.tsx";
import MyPage from "./pages/mypage/page.tsx";

import "./index.css";
import { AuthProvider } from "./contexts/auth.tsx";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<Layout />}>
      <Route index element={<MainPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="posts" element={<PostsPage />} />
      <Route path="posts/:id" element={<PostedPage />} />
      <Route path="mypage" element={<MyPage />} />
      <Route path="category-daily" element={<MainPage />} />
      <Route path="category-qna" element={<MainPage />} />
      <Route path="category-study" element={<MainPage />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
