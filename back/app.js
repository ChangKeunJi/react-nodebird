const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv");
const morgan = require("morgan");
const hpp = require("hpp");
const helmet = require("helmet");

const app = express();

const db = require("./models");
const passportConfig = require("./passport");

const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
const userRouter = require("./routes/user");
const hashtagRouter = require("./routes/hashtag");

dotenv.config();

db.sequelize
  .sync()
  .then(() => console.log("db 연결 성공"))
  .catch(console.error);

passportConfig();

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  // 보안을 위해서
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(morgan("dev"));
}

// 모든 요청에 대해 cors 요청 설정
app.use(
  cors({
    // origin:'https://nodebird.com'
    // origin: "http://localhost:3000",
    origin: ["http://localhost:3000", "nodebird.com"],
    credentials: true, // 쿠키를 전달해준다.
  })
);

// upload 폴더의 이미지를 프론트로 보내준다.
// => localhost:3065/사진경로
app.use("/", express.static(path.join(__dirname, "uploads")));
// 프론트에서 보내준 데이터를 req.body안에 넣어준다. router보다 위에 위치해야 한다.
// 프론트에서 백엔드로 데이터를 보낼 때 벡엔드는 아래 두 가지 방식으로만 데이터를 받는다.
app.use(express.json()); // json파일(axios로 데이터 보낼 때)
app.use(express.urlencoded({ extended: true })); // 일반 foam을 보낼 때

// 로그인 시
app.use(cookieParser("nodebirdsecret"));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET, //
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);
app.use("/hashtag", hashtagRouter);

// 에러처리 미들웨어(특별히 에러처리를 커스텀하고 싶을 때 사용)
// app.use((err, req, res, next) => {});

app.listen(3065, () => {
  console.log("실행 중!!");
});

// 1. Node는 서버가 아니다. Node에서 제공하는 http 모듈이 서버를 만드는 기능을 가지고 있다.
// 2. 생 Node에서 http 모듈로 서버를 만들기 위해서는 복잡한 과정을 거쳐야 한다. 그래서
//    생긴것이 Node의 프레임워크 Express이다. Express도 내부적으로 http 모듈을 사용한다.

// const http = require("http");
//
// const server = http.createServer((req, res) => {
//   console.log(req.url, req.method);
//
//   if (req.method === "GET") {
//     if (req.url === "/api") {
//       // Do Something ...
//     }
//   }
//
//   if (req.method === "POST") {
//     if (req.url === "/api/data") {
//       // Do Something ...
//     }
//   }
//
//   res.end("Hello Node");
// });
//
// server.listen(3065, () => {
//   console.log("실행 중");
// });
