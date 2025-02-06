import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../contexts/auth";
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
  const { token } = useContext(AuthContext);
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

  const logoutHandler = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    location.reload();
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
          <HeaderButton onClick={logoutHandler}>로그아웃2</HeaderButton>
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
