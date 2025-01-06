import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

import styles from "../page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div>로그인</div>
      <InputBox placeholder={"@닉네임"} />
      <InputBox placeholder={"비밀번호"} />
      <Button buttonName={"로그인"} />
    </div>
  );
}
