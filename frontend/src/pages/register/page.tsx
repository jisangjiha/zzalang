import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth-context";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import AuthLink from "../../components/AuthLink";

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

  const devApi = import.meta.env.VITE_API_BASE_URL;

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
        label="이름"
        placeholder="이름을 입력하세요"
        value={registerData.name}
        onChange={(e) => {
          setRegisterData({ ...registerData, name: e.target.value });
        }}
      />
      <InputBox
        label="아이디"
        placeholder="아이디를 입력하세요"
        value={registerData.handle}
        onChange={(e) => {
          setRegisterData({ ...registerData, handle: e.target.value });
        }}
      />
      <InputBox
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        type="password"
        value={registerData.password}
        onChange={(e) => {
          setRegisterData({ ...registerData, password: e.target.value });
        }}
      />
      <InputBox
        label="비밀번호 확인"
        placeholder="비밀번호를 한 번 더 입력하세요"
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
      <AuthLink type="register" />
    </form>
  );
}
