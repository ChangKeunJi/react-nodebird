const express = require("express");
const { User, Post, Comment, Image } = require("../models"); // db.User
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Op } = require("sequelize");

//! 본인 정보 가져오기
router.get("/", async (req, res, next) => {
  try {
    // 로그인이 되었을 때만 사용자 정보를 보내준다
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        // attributes: ["id", "nickname", "email"], // 포함시키고 싶은 속성들
        attributes: {
          exclude: ["password"], // 속성들 중 비밀번호만 제외
        },
        // User Model에서 hasMany, belongsToMany를 통해서, 관계를 맺어주었기에 include를 통해서 포함시킬 수 있다
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });

      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! Sign Up
router.post("/", isNotLoggedIn, async (req, res, next) => {
  // POST & /user/
  try {
    // 중복된 email이 있는지 확인한다.
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (exUser) {
      return res.status(403).send("이미 사용중인 아이디입니다. ");
      // return 없으면 아래 것도 같이 실행된다.
    }
    // 10 ~ 13 사이의 숫자를 넣어준다. 높을 수록 보안 높고 시간 오래걸린다.
    const hashedPassword = await bcrypt.hash(req.body.password, 11);
    await User.create({
      // User.create는 비수기 함수
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res.status(201).send("OK");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//! Log In
router.post("/login", isNotLoggedIn, (req, res, next) => {
  // Local은 웹페이지의 이메일과 비밀번호로 로그인
  passport.authenticate("local", (err, user, info) => {
    // err, user, info는 done 함수의 매개변수들
    // local.js의 done 함수가 호출되면, (err,user,info) => {} 콜백 함수가 호출된다.

    if (err) {
      // 서버에러
      console.error(err);
      return next(err); // 에러처리 미들웨어로 보낸다
    }

    if (info) {
      // 클라이언트 에러
      return res.status(401).send(info.reason);
    }

    // passport.serializeUser가 호출된다
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        // attributes: ["id", "nickname", "email"], // 포함시키고 싶은 속성들
        attributes: {
          exclude: ["password"], // 속성들 중 비밀번호만 제외
        },
        // User Model에서 hasMany, belongsToMany를 통해서, 관계를 맺어주었기에 include를 통해서 포함시킬 수 있다
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });

      // 쿠키 & 사용자 정보를 프론트로 넘겨준다 => saga의 result로 들어간다
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

//! Log out

router.post("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("OK");
});

//! 닉네임 수정

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user.id },
      }
    );

    res.status(200).json({ nickname: req.body.nickname });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 미들웨어는 작성 순서가 중요하다
//! ":" 붙은 와이드 카드는 최하단에 놓아야 한다

//! 팔로워, 팔로잉 리스트 불러오기

router.get("/followers", isLoggedIn, async (req, res, next) => {
  try {
    // 팔로우 하려는 user가 실제로 존해하는지 확인
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("없는 사람을 찾으려고 하시네요?");
    }
    const followers = await user.getFollowers({
      limit: Number(req.query.limit),
    });

    res.status(200).json(followers);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/followings", isLoggedIn, async (req, res, next) => {
  try {
    // 팔로우 하려는 user가 실제로 존해하는지 확인
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("없는 사람을 찾으려고 하시네요?");
    }
    const followings = await user.getFollowings({
      limit: Number(req.query.limit),
    });

    res.status(200).json(followings);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
//! 팔로우 추가

router.patch("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    // 팔로우 하려는 user가 실제로 존해하는지 확인
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("유저가 존재하지 않습니다!!");
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: Number(req.params.userId) });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 팔로우 취소

router.delete("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    // 팔로우 하려는 user가 실제로 존해하는지 확인
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("유저가 존재하지 않습니다!!");
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: Number(req.params.userId) });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/follower/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("유저가 존재하지 않습니다!!");
    }

    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: Number(req.params.userId) });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 특정 유저 게시물만 가져오기

router.get("/:userId/posts", async (req, res, next) => {
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 때닐 때
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
      // lastId보다 작은것 10개를 불러오게 하는 방법 (Operator, less then)
    }

    const posts = await Post.findAll({
      where,
      // offset: 0, // 1번 게시물부터 시작해서 => 이 방식을 사용하면 게시물 추가, 삭제하면 꼬이기 쉽다
      limit: 10, // 10개의 게시물만 가져와라
      order: [
        ["createdAt", "DESC"], // 게시글 정렬
        [Comment, "createdAt", "DESC"], // 댓글 정렬
      ], // DESC는 내림차순: 최신 게시물부터 가져온다
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          // post.Likers를 생성해준다.
          model: User, // 좋아요 누른 사람
          as: "Likers",
          attributes: ["id"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 특정 유저의 정보 가져오기
router.get("/:id", async (req, res, next) => {
  try {
    // 로그인이 되었을 때만 사용자 정보를 보내준다

    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.id },
      // attributes: ["id", "nickname", "email"], // 포함시키고 싶은 속성들
      attributes: {
        exclude: ["password"], // 속성들 중 비밀번호만 제외
      },
      // User Model에서 hasMany, belongsToMany를 통해서, 관계를 맺어주었기에 include를 통해서 포함시킬 수 있다
      include: [
        {
          model: Post,
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"],
        },
      ],
    });

    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON(); // toJSON 을 붙여야 수정가능하다
      // 개인 정보 보호를 위해서 서버에서 길이만 전달해준다
      data.Posts = data.Posts.length;
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;

      res.status(200).json(data);
    } else {
      res.status(404).json("존재하지 않는 유저");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
