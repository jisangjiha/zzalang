import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../contexts/auth-context";
import logo from "../../assets/casper.svg";

import styles from "./Header.module.css";
import HeaderButton from "../../components/HeaderButton";

type User = {
  id: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
};

export default function Header() {
  const { token, clearToken } = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch("http://localhost:8787/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((u) => setUser(u));
  }, [token]);

  const handleLogout = () => {
    fetch("http://localhost:8787/v1/sign-out", {
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
          <Link to="/mypage">{user.name}님 환영합니다</Link>
          <HeaderButton onClick={handleLogout}>로그아웃</HeaderButton>
        </div>
      ) : (
        <div className={styles.identify}>
          <Link to="/register">회원가입</Link>
          <Link to="/login">로그인</Link>
        </div>
      )}
    </header>
  );
}
