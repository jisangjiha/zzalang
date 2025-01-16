import { createContext, ReactNode, useState } from "react";

export const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string) => void;
}>({ token: null, setToken: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
