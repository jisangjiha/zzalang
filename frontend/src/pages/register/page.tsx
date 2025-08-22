import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth-context";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

//mypage - apt PATCH
//구색맞추기
//개인정보 수정
//회원가입, 로그인 시 입력 안될 때 안넘어가게

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [registerData, setRegisterData] = useState({
    name: "",
    handle: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const devApi = import.meta.env.VITE_API_URL;

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        fetch(`${devApi}/v1/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerData.name,
            handle: registerData.handle,
            password: registerData.password,
            passwordConfirmation: registerData.passwordConfirmation,
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
      <div className={styles.pageName}>회원가입</div>
      <InputBox
        placeholder={"이름"}
        value={registerData.name}
        onChange={(e) => {
          setRegisterData({ ...registerData, name: e.target.value });
        }}
      />
      <InputBox
        placeholder={"아이디"}
        value={registerData.handle}
        onChange={(e) => {
          setRegisterData({ ...registerData, handle: e.target.value });
        }}
      />
      <InputBox
        placeholder={"비밀번호"}
        type="password"
        value={registerData.password}
        onChange={(e) => {
          setRegisterData({ ...registerData, password: e.target.value });
        }}
      />
      <InputBox
        placeholder={"비밀번호 확인"}
        type="password"
        value={registerData.passwordConfirmation}
        onChange={(e) => {
          setRegisterData({
            ...registerData,
            passwordConfirmation: e.target.value,
          });
        }}
      />
      <p className={styles.errorMessage}>{errorMessage}</p>
      <Button type="submit">회원가입</Button>
    </form>
  );
}
