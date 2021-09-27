import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { END } from "redux-saga";

import axios from "axios";
import AppLayout from "../components/AppLayout";
import PostForm from "../components/postForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import wrapper from "../store/configureStore";

const Home = () => {
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);

  const dispatch = useDispatch();

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_MY_INFO_REQUEST,
  //   });
  //
  //   dispatch({
  //     type: LOAD_POSTS_REQUEST,
  //   });
  // }, []);

  useEffect(() => {
    function onScroll() {
      const { scrollY } = window; // 맨 위에서 현재 스크롤까지의 길이 (a)
      const { clientHeight } = document.documentElement; // 브라우저 창 높이 (b)
      const { scrollHeight } = document.documentElement; // 총 콘텐츠 길이 (c)
      // a + b = c

      if (scrollHeight - (scrollY + clientHeight) < 300) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
        }
      }
      // react-virtualized를 사용하면 브라우저의 메모리를 관리해주면서 게시글을 보여준다.
    }

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

// Home 컴포넌트보다 먼저 실행된다 & 브라우저가 아닌 순전히 프론트 서버에서만 실행된다.
// 그런 이유로 브라우저에서 보내주는 쿠키를 서버로 보내는것이 아니라,  프론트 서버에서 쿠키를 담아 서버로 보내야 한다
export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (req, res, next) => {
    const cookie = req.req ? req.req.headers.cookie : "";
    // 다수의 브라우저에서 하나의 프론트 서버를 거쳐 백엔드 서버로 요청을 보낸다
    // 프론트 서버의 쿠키 값을 비워주지 않으면, 타인이 자신의 쿠키를 가지고 접속을 하는 경우가 발생한다
    // 그런 이유로 매번 요청을 하기 전 기존 쿠키를 비우고 자신의 쿠키를 담아 백엔드에 요청을 한다
    axios.defaults.headers.Cookie = "";
    if (req.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }

    store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    store.dispatch({
      type: LOAD_POSTS_REQUEST,
    });
    // => dispatch 하고 SUCCESS 까지 된 실행결과를 HYDRATE 로 보내준다

    // REQUEST 가 saga 에서 SUCCESS 될 때까지 기다려준다
    store.dispatch(END);
    await store.sagaTask.toPromise();
  }
);

export default Home;
