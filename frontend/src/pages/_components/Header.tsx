import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../contexts/auth-context";
import logo from "../../assets/casper.svg";
import Category from "./Category";

import styles from "./Header.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const navigate = useNavigate();

  const { token, user, clearToken } = useContext(AuthContext);

  const handleLogout = () => {
    fetch(`${API_BASE_URL}/v1/sign-out`, {
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
    <>
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
      <Category />
    </>
  );
}
