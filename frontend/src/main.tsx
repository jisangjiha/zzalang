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

const router = createBrowserRouter(
  createRoutesFromChildren(
    <>
      <Route path="" element={<App />} />
      <Route path="test" element={<Test />} />
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
