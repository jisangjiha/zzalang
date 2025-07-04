import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import Button from "../../components/Button";
import styles from "../page.module.css";
import InputBox from "../../components/InputBox";

export default function MyPage() {
  const { token } = useContext(AuthContext);
  const [myData, setMyData] = useState({
    name: "",
    handle: "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const handleInputChange = (field: string, value: string) => {
    setMyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetch("http://localhost:8787/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      res.json().then((data) => {
        setMyData({
          ...myData,
          name: data.name,
          handle: data.handle,
        });
      });
    });
  }, [token]);

  const handleModify = () => {
    fetch("http://localhost:8787/v1/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: myData.name,
        handle: myData.handle,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const { message } = await res.json();
        setErrorMessage(message);
        return;
      }
      const result = await res.json();
      console.log("수정 성공:", result);
      setErrorMessage(undefined);
      alert("정보가 성공적으로 수정되었습니다!");
    });
  };

  return (
    <form className={styles.container}>
      <div className={styles.pageName}>회원정보</div>
      <div>이름</div>
      <InputBox
        value={myData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
      />
      <div>닉네임</div>
      <InputBox
        value={myData.handle}
        onChange={(e) => handleInputChange("handle", e.target.value)}
      />
      <div>현재 비밀번호</div>
      <InputBox
        type="password"
        placeholder="현재 비밀번호를 입력하세요"
        value={myData.currentPassword}
        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
      />
      <div>새 비밀번호</div>
      <InputBox
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        value={myData.newPassword}
        onChange={(e) => handleInputChange("newPassword", e.target.value)}
      />
      <div>새 비밀번호 확인</div>
      <InputBox
        type="password"
        placeholder="새 비밀번호를 한 번 더 입력하세요"
        value={myData.newPasswordConfirmation}
        onChange={(e) =>
          handleInputChange("newPasswordConfirmation", e.target.value)
        }
      />
      <p className={styles.errorMessage}>{errorMessage}</p>
      <Button onClick={handleModify}>수정하기</Button>
    </form>
  );
}
