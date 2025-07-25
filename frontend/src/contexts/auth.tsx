import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string) => void;
  clearToken: () => void;
}>({ token: null, setToken: () => {}, clearToken: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const clearToken = useCallback(() => setToken(null), []);

  // 개발 모드에서 자동 로그인
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment && !token) {
      // 개발용 고정 계정으로 자동 로그인
      const autoLogin = async () => {
        try {
          const response = await fetch("http://localhost:8787/v1/sign-in", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              handle: "jisang", // 개발용 계정
              password: "jisang123", // 개발용 비밀번호
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
          }
        } catch {
          console.log("자동 로그인 실패 - 수동으로 로그인해주세요");
        }
      };

      autoLogin();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}
