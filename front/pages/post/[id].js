// post/[id].js : id 가 동적으로 변한다
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Head from "next/head";
import axios from "axios";
import { END } from "redux-saga";
import PostCard from "../../components/PostCard";
import { LOAD_MY_INFO_REQUEST } from "../../reducers/user";
import { LOAD_POST_REQUEST } from "../../reducers/post";
import AppLayout from "../../components/AppLayout";
import wrapper from "../../store/configureStore";

const Post = () => {
  const router = useRouter();
  const { singlePost } = useSelector((state) => state.post);
  const { id } = router.query;

  // // fallback 이 true 이고, path 존재하지 않을 때 CSR 하도록 기다려준다
  // if (router.isFallback) {
  //   return <div>로딩 중...</div>;
  // }

  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        {/* 포스팅을 공유할 때 아래 meta 정보들이 참조된다 */}
        <meta name="description" content={singlePost.content} />
        <meta
          property="og:title"
          content={`${singlePost.User.nickname}님의 게시글`}
        />
        <meta property="og:description" content={singlePost.content} />
        <meta
          property="og:image"
          content={
            singlePost.Images[0]
              ? singlePost.Images[0].src
              : "https://nodebird.com/favicon.ico"
          }
        />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

// // 다이나믹 라우팅으로 정적 사이트를 불러오고 싶을 때는 미리 path 를 세팅해놔야 한다
// export async function getStaticPaths() {
//   return {
//     paths: [
//       { params: { id: "8" } },
//       { params: { id: "10" } },
//       { params: { id: "37" } },
//       // { params: { id: "38" } },
//     ],
//     fallback: true,
//     // true 로 하면 존재하지 않는 path 도 error 나지 않는다 대신 SSR 이 안된다
//   };
// }

// getServersideProps 대신 사용해봄
export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (req, res) => {
    const cookie = req.req ? req.req.headers.cookie : "";
    axios.defaults.headers.Cookie = "";
    if (req.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }

    store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    // 단일 게시글 불러오기
    store.dispatch({
      type: LOAD_POST_REQUEST,
      data: req.params.id,
    });

    store.dispatch(END);
    await store.sagaTask.toPromise();
  }
);

export default Post;
