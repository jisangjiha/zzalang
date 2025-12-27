import { createContext } from "react";

export type User = {
  id: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
};

export const AuthContext = createContext<{
  token: string | null;
  user: User | null;
  setToken: (t: string) => void;
  clearToken: () => void;
  isLoadingUser: boolean;
}>({
  token: null,
  user: null,
  setToken: () => {},
  clearToken: () => {},
  isLoadingUser: false,
});
