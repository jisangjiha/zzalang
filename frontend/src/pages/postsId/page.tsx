import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Post, User } from "../../types";
import styles from "../page.module.css";

export default function PostsIdPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [authorHandle, setAuthorHandle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const devApi = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!id) {
      setError("게시글 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${devApi}/v1/posts/${id}`);
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const data: Post = await response.json();
        setPost(data);

        // authorId를 이용해서 작성자 handle 가져오기
        try {
          const userRes = await fetch(`${devApi}/v1/users/${data.authorId}`);
          if (userRes.ok) {
            const user: User = await userRes.json();
            setAuthorHandle(user.handle);
          }
        } catch {
          setAuthorHandle("알 수 없음");
        }
      } catch (err) {
        console.log("Failed to fetch post:", err);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [devApi, id]);

  if (isLoading) {
    return <div className={styles.mainContainer}>Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className={styles.mainContainer}>
        {error || "게시글이 없습니다."}
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postsIdContainer}>
        <h2>{post.title}</h2>
        <div>
          <span>{authorHandle}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}
