import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import styles from "./page.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div>회원가입</div>
      <InputBox placeholder={"이름"} />
      <InputBox placeholder={"닉네임"} />
      <InputBox placeholder={"비밀번호"} />
      <InputBox placeholder={"비밀번호 확인"} />
      <Button buttonName={"회원가입"} />
    </div>
  );
}
