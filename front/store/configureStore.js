import { createWrapper } from "next-redux-wrapper";
import { compose, createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";

import reducer from "../reducers";
import rootSaga from "../sagas";

const loggerMiddleware =
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    return next(action);
  };

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware, loggerMiddleware];

  const enhancer =
    process.env.NODE_ENV === "production"
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, enhancer);

  store.sagaTask = sagaMiddleware.run(rootSaga);

  return store;
};

// createWrapper는 next 라이프사이클에 redux를 결합시키는 역할을 한다
// 각 페이지 내에서 wrapper를 통해서 SSR을 적용시킨다
const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === "development", // true일 때 버그를 자세히 설명
});

export default wrapper;
