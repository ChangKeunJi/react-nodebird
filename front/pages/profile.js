import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { END } from "redux-saga";
import Router from "next/router";
import useSWR from "swr";

import {
  LOAD_FOLLOWERS_REQUEST,
  LOAD_FOLLOWINGS_REQUEST,
  LOAD_MY_INFO_REQUEST,
} from "../reducers/user";
import wrapper from "../store/configureStore";
import { LOAD_POSTS_REQUEST } from "../reducers/post";

import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  //! ===== SWR 사용

  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  const { data: followersData, followerError } = useSWR(
    `http://localhost:3065/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { data: followingsData, followingError } = useSWR(
    `http://localhost:3065/user/followings?limit=${followingsLimit}`,
    fetcher
  );

  // data & error 가 없으면 로딩 중

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => {
      return prev + 3;
    });
  }, []);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => {
      return prev + 3;
    });
  }, []);

  //! ===== SWR 사용

  // const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   });
  // }, []);

  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }

    if (!me) {
      return "내 정보 로딩 중";
    }

    //! return 이 hooks 보다 먼저 발생하면 안된다
    // 만약 에러가 발생해 return 해버리면 아래 있는 hooks 들이 실행되지 않아 에러가 난다
    if (followerError || followingError) {
      console.error(followerError || followingError);
      return <div>팔로잉 팔로워 로딩 중 에러 발생</div>;
    }
  }, [me && me.id, followerError, followingError]);

  return (
    <>
      <Head>
        <title>내 프로필 | Nodebird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉"
          data={followingsData}
          onClickMore={loadMoreFollowings}
          loading={!followingsData && !followingError}
        />
        <FollowList
          header="팔로워"
          data={followersData}
          onClickMore={loadMoreFollowers}
          loading={!followersData && !followerError}
        />
      </AppLayout>
    </>
  );
};

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

    store.dispatch({
      type: LOAD_POSTS_REQUEST,
    });

    store.dispatch(END);
    await store.sagaTask.toPromise();
  }
);

export default Profile;
