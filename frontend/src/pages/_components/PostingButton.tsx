import { useNavigate } from "react-router-dom";

export default function PostingButton() {
  const navigate = useNavigate();

  return <button onClick={() => navigate("/posting")}>글쓰기</button>;
}
