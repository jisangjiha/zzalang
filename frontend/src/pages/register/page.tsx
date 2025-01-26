import { useNavigate } from "react-router-dom";
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
          navigate("/");
        });
      }}
    >
      <div>회원가입</div>
      <InputBox
        placeholder={"이름"}
        value={registerData.name}
        onChange={(e) => {
          setRegisterData({ ...registerData, name: e.target.value });
        }}
      />
      <InputBox
        placeholder={"닉네임"}
        value={registerData.handle}
        onChange={(e) => {
          setRegisterData({ ...registerData, handle: e.target.value });
        }}
      />
      <InputBox
        placeholder={"비밀번호"}
        value={registerData.password}
        onChange={(e) => {
          setRegisterData({ ...registerData, password: e.target.value });
        }}
      />
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
      <Button type="submit">회원가입</Button>
    </form>
  );
}
