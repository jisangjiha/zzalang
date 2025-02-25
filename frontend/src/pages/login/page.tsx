import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [loginState, setLoginState] = useState({
    handle: "",
    password: "",
  });

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        console.log(loginState);
        fetch("http://localhost:8787/v1/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            handle: loginState.handle,
            password: loginState.password,
          }),
        }).then(async (res) => {
          const data = await res.json();
          setToken(data.token);
          navigate("/");
        });
      }}
    >
      <div>로그인</div>
      <InputBox
        placeholder={"@닉네임"}
        value={loginState.handle}
        onChange={(e) => {
          setLoginState({
            ...loginState,
            handle: e.target.value,
          });
        }}
      />
      <InputBox
        placeholder={"비밀번호"}
        type="password"
        value={loginState.password}
        onChange={(e) => {
          setLoginState({ ...loginState, password: e.target.value });
        }}
      />
      <Button type="submit">로그인</Button>
    </form>
  );
}
