import {
  all,
  fork,
  // call,
  // takeEvery,
  // takeLatest,
  // put,
  // throttle,
  // delay,
} from "redux-saga/effects";
import axios from "axios";

import postSaga from "./post";
import userSaga from "./user";
import { backUrl } from "../config/config";

// backend ip 를 넣어줘야 한다
axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true;

export default function* rootSaga() {
  yield all([fork(postSaga), fork(userSaga)]);
}
