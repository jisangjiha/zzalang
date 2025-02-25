import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

//가입 완료 되면 alert 가입 완료 되었다고---------------완
//실패하면 페이지 넘어가지 않게!-----------------------완
//pr

//에러메시지(helper text) 진짜일때만------------------완
//안맞으면 회원가입못하게
//비밀번호 *으로 > input type=password

//login
//비밀번호 *으로 > input type=password

//main branch = layout: footer 바닥에 붙게

//mypage - apt PATCH
//구색맞추기
//개인정보 수정

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [registerData, setRegisterData] = useState({
    name: "",
    handle: "",
    password: "",
    passwordConfirmation: "",
  });

  const nameRegExp = /^[ㄱ-ㅎ가-힣a-zA-Z]{2,}$/;
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
          if (!data.message) {
            navigate("/");
            alert("가입이 완료되었습니다:)");
          }
          // 빈칸에 따라 다른 알람 문구가 나오면 더 좋을듯?
          alert("가입에 실패하였습니다:(");
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
        <p>
          {registerData.name.length && !nameRegExp.test(registerData.name)
            ? "두 글자 이상 문자만 입력하세요"
            : ""}
        </p>
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
          {registerData.handle.length && !handleRegExp.test(registerData.handle)
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
          {registerData.password.length
            ? registerData.handle === registerData.password
              ? "handle과 같을 수 없습니다"
              : !passwordRegExp.test(registerData.password)
              ? "숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요"
              : ""
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
          {registerData.passwordConfirmation.length &&
          registerData.password !== registerData.passwordConfirmation
            ? "비밀번호가 일치하지 않습니다"
            : ""}
        </p>
      </div>
      <Button type="submit">회원가입</Button>
    </form>
  );
}
