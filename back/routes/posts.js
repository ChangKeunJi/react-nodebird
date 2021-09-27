const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Post, User, Image, Comment } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    const where = {};
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

module.exports = router;
