const passport = require("passport");
const local = require("./local");
const { User } = require("../models");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 쿠키와 user의 id만 들고있다
    done(null, user.id); // (서버에러, 성공)
  });

  // 로그인 성공 후 그 다음 요청부터 호출됨.
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user); // user정보를 req.user 안에 넣어준다
    } catch (err) {
      console.error(err);
      done(err);
    }
  });

  local();
};
