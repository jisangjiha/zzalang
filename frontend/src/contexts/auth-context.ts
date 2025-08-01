import { createContext } from "react";

export const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string) => void;
  clearToken: () => void;
}>({ token: null, setToken: () => {}, clearToken: () => {} });
