import { ReactNode, useCallback, useEffect, useState } from "react";
import { AuthContext, User } from "./auth-context";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const clearToken = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // 토큰이 있을 때 사용자 정보 가져오기
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch(`${API_BASE_URL}/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: User = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

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
    <AuthContext.Provider
      value={{ token, user, setToken, clearToken, isLoadingUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export type { User };
