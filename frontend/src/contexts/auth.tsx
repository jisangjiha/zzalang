import { ReactNode, useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const clearToken = useCallback(() => setToken(null), []);

  // 개발 모드에서 자동 로그인
  useEffect(() => {
    const isDevelopment = import.meta.env.VITE_API_BASE_URL;
    const devHandle = import.meta.env.VITE_DEV_HANDLE;
    const devPassword = import.meta.env.VITE_DEV_PASSWORD;

    if (isDevelopment && !token && devHandle && devPassword) {
      // 개발용 고정 계정으로 자동 로그인
      const autoLogin = async () => {
        try {
          const response = await fetch(`${isDevelopment}/v1/sign-in`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              handle: devHandle,
              password: devPassword,
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
