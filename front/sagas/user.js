import {
  all,
  fork,
  takeLatest,
  put,
  throttle,
  delay,
  call,
} from "redux-saga/effects";
import axios from "axios";
import {
  CHANGE_NICKNAME_REQUEST,
  CHANGE_NICKNAME_SUCCESS,
  CHANGE_NICKNAME_FAILURE,
  FOLLOW_FAILURE,
  FOLLOW_REQUEST,
  FOLLOW_SUCCESS,
  LOAD_MY_INFO_FAILURE,
  LOAD_MY_INFO_REQUEST,
  LOAD_MY_INFO_SUCCESS,
  LOG_IN_FAILURE,
  LOG_IN_REQUEST,
  LOG_IN_SUCCESS,
  LOG_OUT_FAILURE,
  LOG_OUT_REQUEST,
  LOG_OUT_SUCCESS,
  SIGN_UP_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  UNFOLLOW_FAILURE,
  UNFOLLOW_REQUEST,
  UNFOLLOW_SUCCESS,
  LOAD_FOLLOWINGS_REQUEST,
  LOAD_FOLLOWERS_REQUEST,
  LOAD_FOLLOWERS_SUCCESS,
  LOAD_FOLLOWERS_FAILURE,
  LOAD_FOLLOWINGS_SUCCESS,
  LOAD_FOLLOWINGS_FAILURE,
  REMOVE_FOLLOWER_REQUEST,
  REMOVE_FOLLOWER_SUCCESS,
  REMOVE_FOLLOWER_FAILURE,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAILURE,
  LOAD_USER_REQUEST,
} from "../reducers/user";

//! ======== Log In ==========

function logInAPI(data) {
  return axios.post("/user/login", data);
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    // logInAPI를 호출한다.
    // call은 동기 함수 호출, fork는 비동기 함수 호출
    // call을 호출하면, 작업이 완료된 뒤에야 다음 코드로 넘어간다.
    // fork로 호출하면, 비동기로 넘기고 다음 작업으로 넘어간다.
    yield put({
      // put은 dispatch 기능을 한다.
      type: LOG_IN_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchLogIn() {
  //1)
  // while (true) {
  //     yield take("LOG_IN_REQUEST", logIn);
  //   }

  //2)
  // yield takeEvery("LOG_IN_REQUEST", logIn);

  //3)
  // yield takeLatest("LOG_IN_REQUEST", logIn);

  //4)

  yield throttle(1000, LOG_IN_REQUEST, logIn);

  // "LOG_IN_REQUEST" 이라는 액션이 실행될 때까지 기다리겠다. (마치 eventlistner처럼)
  // 액션이 실행되면, logIn 함수를 호출한다. 함수의 매개변수로 action이 전달된다.

  // 로그인 한 번하면 사라진다. 그래서 while(true)로 감싸는 이유다.
  // takeEvery 역시 같은 이유. 그러나 takeEvery는 비동기적으로 작동한다. while은 동기적.

  // takeEvery는  모든 요청을 전달하지만, takeLatest는 마지막 요청 하나만 처리.
  // takeLatest는 요청을 취소하는것이 아니라, 응답을 취소한다. api 요청은 모두 전달되고,
  // 응답 중 최신 요청에 대한 응답만 받는다. 그렇게 되면, 서버에는 연달아 데이터가 저장된다.
  // 그런 이유로 서버에서 한번 더 검사를 해줘야 한다.

  // throttle은 제한된 시간에 한 번만 요청이 가능하다.
}

//! ========= Log Out ============

function logOutAPI() {
  return axios.post("/user/logout");
}

function* logOut() {
  try {
    yield call(logOutAPI);

    yield put({
      // put은 dispatch 기능을 한다.
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: LOG_OUT_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}

//! ======== Sign Up ==========

function signUpAPI(data) {
  return axios.post("/user", data);
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data);

    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    console.log(err, "sagas");
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

//! ====== Follow ======

function followAPI(data) {
  return axios.patch(`/user/${data}/follow`);
}

function* follow(action) {
  try {
    const result = yield call(followAPI, action.data);

    yield put({
      type: FOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: FOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}

//! ====== 팔로잉 취소 ======

function unfollowAPI(data) {
  return axios.delete(`/user/${data}/follow`);
}

function* unfollow(action) {
  try {
    const result = yield call(unfollowAPI, action.data);

    yield put({
      type: UNFOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UNFOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchUnfollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}

//! ===== 팔로워 제거 =====

function removeFollowerAPI(data) {
  return axios.delete(`/user/follower/${data}`);
}

function* removeFollower(action) {
  try {
    const result = yield call(removeFollowerAPI, action.data);

    yield put({
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: REMOVE_FOLLOWER_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchRemoveFollower() {
  yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

//! Watch User

function loadUserAPI(data) {
  return axios.get(`/user/${data}`);
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);

    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_USER_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser);
}

//! ===== loadMyInfo 내 정보 불러오기 =====

function loadMyInfoAPI() {
  return axios.get("/user");
}

function* loadMyInfo() {
  try {
    const result = yield call(loadMyInfoAPI);

    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_MY_INFO_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchMyInfo() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

//! 닉네임 수정

function changeNicknameAPI(data) {
  return axios.patch("/user/nickname", { nickname: data });
}

function* changeNickname(action) {
  try {
    const result = yield call(changeNicknameAPI, action.data);

    yield put({
      type: CHANGE_NICKNAME_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: CHANGE_NICKNAME_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchChangeNickname() {
  yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

//! 팔로잉 & 팔로워 정보 가져오기

function loadFollowersAPI() {
  return axios.get("/user/followers");
}

function* loadFollowers() {
  try {
    const result = yield call(loadFollowersAPI);

    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadFollowers() {
  yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function loadFollowingsAPI() {
  return axios.get("/user/followings");
}

function* loadFollowings() {
  try {
    const result = yield call(loadFollowingsAPI);

    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchLoadFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

//! Export User Saga

export default function* userSaga() {
  yield all([
    fork(watchLoadUser),
    fork(watchMyInfo),
    fork(watchFollow),
    fork(watchUnfollow),
    fork(watchRemoveFollower),
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchSignUp),
    fork(watchChangeNickname),
    fork(watchLoadFollowers),
    fork(watchLoadFollowings),
  ]);
  // all은 배열안의 것들을 한방에 실행시켜준다.
  // fork는 함수를 실행시켜준다.
}
