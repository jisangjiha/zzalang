import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth-context";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import AuthLink from "../../components/AuthLink";

import styles from "../page.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [loginState, setLoginState] = useState({
    handle: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const devApi = import.meta.env.VITE_API_BASE_URL;

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        console.log("submit");
        e.preventDefault();
        fetch(`${devApi}/v1/sign-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            handle: loginState.handle,
            password: loginState.password,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const { message } = await res.json();
            setErrorMessage(message);
            return;
          }
          const data = await res.json();
          setToken(data.token);
          navigate("/");
        });
      }}
    >
      <div className={styles.pageName}>로그인</div>
      <InputBox
        label="아이디"
        placeholder="아이디를 입력하세요"
        value={loginState.handle}
        onChange={(e) => {
          setLoginState({
            ...loginState,
            handle: e.target.value,
          });
        }}
      />
      <InputBox
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        type="password"
        value={loginState.password}
        onChange={(e) => {
          setLoginState({ ...loginState, password: e.target.value });
        }}
      />
      <p className={styles.errorMessage}>{errorMessage}</p>
      <Button type="submit">로그인</Button>
      <AuthLink type="login" />
    </form>
  );
}
