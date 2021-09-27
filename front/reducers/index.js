import { HYDRATE } from "next-redux-wrapper";
import { combineReducers } from "redux";
import user from "./user";
import post from "./post";

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      // console.log("HYDRATE", action);
      return action.payload;
    // 새로운 상태를 반환한다.
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

// const rootReducer = combineReducers({
//   // HYDRATE(ssr에 필요한)를 위한 reducer
//   index: (state = {}, action) => {
//     switch (action.type) {
//       case HYDRATE:
//         return { ...state, ...action.payload };
//       default:
//         return state;
//     }
//   },
//   user,
//   post,
// });

export default rootReducer;
