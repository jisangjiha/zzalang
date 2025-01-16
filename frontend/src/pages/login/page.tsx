import { useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <div>로그인</div>
      <InputBox placeholder={"@닉네임"} />
      <InputBox placeholder={"비밀번호"} />
      <Button
        onClick={() => {
          fetch("http://localhost:8787/v1/sign-in", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              handle: "jisang",
              password: "jisang123",
            }),
          }).then(async (res) => {
            const data = await res.json();
            setToken(data.token);
            navigate("/");
          });
        }}
      >
        로그인
      </Button>
    </div>
  );
}
