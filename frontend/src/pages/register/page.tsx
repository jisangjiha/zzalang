import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

//mypage - apt PATCH
//구색맞추기
//개인정보 수정

// 오류 메시지 나오긴 했는데, 정확히 어디서 틀렸는 지 모름
// footer 바닥에 붙게 잘 한 건지,,
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [registerData, setRegisterData] = useState({
    name: "",
    handle: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        fetch("http://localhost:8787/v1/register", {
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
          if (errorMessage === "") {
            navigate("/");
          }
        });
      }}
    >
      <div>회원가입</div>
      <div className={styles.formBox}>
        <label>name</label>
        <InputBox
          placeholder={"이름"}
          value={registerData.name}
          onChange={(e) => {
            setRegisterData({ ...registerData, name: e.target.value });
          }}
        />
      </div>
      <div className={styles.formBox}>
        <label>handle</label>
        <InputBox
          placeholder={"닉네임"}
          value={registerData.handle}
          onChange={(e) => {
            setRegisterData({ ...registerData, handle: e.target.value });
          }}
        />
      </div>
      <div className={styles.formBox}>
        <label>password</label>
        <InputBox
          placeholder={"비밀번호"}
          type="password"
          value={registerData.password}
          onChange={(e) => {
            setRegisterData({ ...registerData, password: e.target.value });
          }}
        />
      </div>
      <div className={styles.formBox}>
        <label>password confirmation</label>
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
      </div>
      <p className={styles.errorMessage}>{errorMessage}</p>
      <Button type="submit">회원가입</Button>
    </form>
  );
}
