const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // req.body.email
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
          });

          // email이 존재하지 않을 때
          if (!user) {
            return done(null, false, { reason: "존재하지 않는 사용자입니다!" });
            // done(서버 에러, 성공, 클라이언트 에러)
          }

          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            // 비밀번호가 일치하지 않을 때
            return done(null, false, { reason: "비밀번호가 틀렸습니다!" });
          }
        } catch (error) {
          console.error(error);
          // 서버 에러 발생했을 시
          return done(error);
        }
      }
    )
  );
};
