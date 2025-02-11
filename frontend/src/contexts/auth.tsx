import { createContext, ReactNode, useCallback, useState } from "react";

export const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string) => void;
  clearToken: () => void;
}>({ token: null, setToken: () => {}, clearToken: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const clearToken = useCallback(() => setToken(null), []);

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}
