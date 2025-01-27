import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [registerData, setRegisterData] = useState({
    name: "",
    handle: "",
    password: "",
    passwordConfirmation: "",
  });
  //유효성 검사를 위함
  const [isRegisterData, setIsRegisterDate] = useState({
    name: false,
    handle: false,
    password: false,
    passwordConfirmation: false,
  });

  const handleRegExp = /^[a-zA-z0-9]{4,12}$/;
  const passwordRegExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;

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
          const data = await res.json();
          setToken(data.token);
          navigate("/login");
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
        <p>{registerData.name.length < 2 ? "두 글자 이상 입력하세요" : ""}</p>
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
        <p>
          {!handleRegExp.test(registerData.handle)
            ? "4-12사이 대소문자 또는 숫자만 입력해 주세요"
            : ""}
        </p>
      </div>
      <div className={styles.formBox}>
        <label>password</label>
        <InputBox
          placeholder={"비밀번호"}
          value={registerData.password}
          onChange={(e) => {
            setRegisterData({ ...registerData, password: e.target.value });
          }}
        />
        <p>
          {registerData.handle === registerData.password
            ? "handle과 같을 수 없습니다"
            : !passwordRegExp.test(registerData.password)
            ? "숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요"
            : ""}
        </p>
      </div>
      <div className={styles.formBox}>
        <label>password confirmation</label>
        <InputBox
          placeholder={"비밀번호 확인"}
          value={registerData.passwordConfirmation}
          onChange={(e) => {
            setRegisterData({
              ...registerData,
              passwordConfirmation: e.target.value,
            });
          }}
        />
        <p>
          {registerData.password !== registerData.passwordConfirmation
            ? "비밀번호가 일치하지 않습니다"
            : ""}
        </p>
      </div>
      <Button type="submit">회원가입</Button>
    </form>
  );
}
