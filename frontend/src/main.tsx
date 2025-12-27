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
import PostingPage from "./pages/posts/page.tsx";
import PostedPage from "./pages/posts/[id]/page.tsx";
import MyPage from "./pages/mypage/page.tsx";
// import CategoriesPage from "./pages/admin/categories/page.tsx";

import "./index.css";
import { AuthProvider } from "./contexts/auth.tsx";
import { CategoryProvider } from "./contexts/category-context.tsx";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<Layout />}>
      <Route index element={<MainPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="posts" element={<PostingPage />} />
      <Route path="posts/:id" element={<PostedPage />} />
      <Route path="posts/:id/edit" element={<PostingPage />} />
      <Route path="mypage" element={<MyPage />} />
      <Route path="categories/:categoryId" element={<MainPage />} />
      {/* 임시 관리자 페이지 - 카테고리 생성 */}
      {/* <Route path="admin/categories" element={<CategoriesPage />} /> */}
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <CategoryProvider>
      <RouterProvider router={router} />
    </CategoryProvider>
  </AuthProvider>
);
