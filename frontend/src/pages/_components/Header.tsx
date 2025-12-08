import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../contexts/auth-context";
import logo from "../../assets/casper.svg";

import styles from "./Header.module.css";

type User = {
  id: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
};

export default function Header() {
  const navigate = useNavigate();

  const { token, clearToken } = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);

  const devApi = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch(`${devApi}/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((u) => setUser(u));
  }, [token]);

  const handleLogout = () => {
    fetch(`${devApi}/v1/sign-out`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(async (res) => {
      await res.json();
      navigate("/");
      clearToken();
    });
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.zzalang}>
        <img src={logo} height={30} width={30} />
        <div>zzalang</div>
      </Link>
      {user ? (
        <div className={styles.identify}>
          <div>{user.name}님</div>
          <Link to="/mypage">마이페이지</Link>
          <Link to="/" onClick={handleLogout}>
            로그아웃
          </Link>
        </div>
      ) : (
        <div className={styles.identify}>
          <Link to="/login">로그인</Link>
          <Link to="/register">회원가입</Link>
        </div>
      )}
    </header>
  );
}
