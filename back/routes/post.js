const express = require("express");
const { Post, Comment, Image, User, Hashtag } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

//! 업로드 폴더 새성

try {
  fs.accessSync("uploads"); // upload 폴더가 있는지 확인
} catch (error) {
  console.log("upload 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

//! 포스트 작성

const upload = multer({
  // 하드 디스크에 저장 (임시)
  storage: multer.diskStorage({
    destination(req, file, done) {
      // 'uploads'라는 폴더에 저장
      done(null, "uploads");
    },
    filename(req, file, done) {
      // 창기.png
      // 노드는 이미지의 이름이 중복된 경우 기존 이미지를 삭제한다
      // 그런 현상을 방지하기 위해 파일명 뒤에 업로드 할 때 날짜를 붙여줘 서로 다른 파일명을 가지게 한다
      const ext = path.extname(file.originalname); // 확장자 추출(.png)
      const basename = path.basename(file.originalname, ext); // 파일명 추출(창기)
      done(null, basename + "_" + new Date().getTime() + ext); // 창기4818231.png
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb로 용량 제한
});

router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });

    // hashtag
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    // [#창근, #창기]. 해쉬태그 없으면 null이 할당된다.
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(
          (tag) =>
            Hashtag.findOrCreate({
              where: { name: tag.slice(1).toLowerCase() },
            })
          // 해시태그가 이미 있으면 생성하지 않는다
          // db에 저장할 때는 소문자로만 저장해서 검색할 때 용이하게 한다
        )
      );
      await post.addHashtags(result.map((v) => v[0]));
      // result가 [[창기,true], [창근, false]] 모양을 하고있기에 boolean은 제외시켜준다
    }

    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        // image가 2개 이상일 때 (image: [창기1.png, 창기2.png]
        const images = await Promise.all(
          req.body.image.map((image) => Image.create({ src: image }))
        );
        await post.addImages(images);
      } else {
        // image가 1개일 때 ( image: 창기.png )
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User, // 댓글 작성자
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User, // 작성자
          attributes: ["id", "nickname"],
        },
        {
          // post.Likers를 생성해준다.
          model: User, // 좋아요 누른 사람
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });

    res.status(201).json(fullPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 댓글 작성
router.post(`/:postId/comment`, isLoggedIn, async (req, res, next) => {
  try {
    // 댓글을 다려는 Post가 실제로 존재하는지 확인
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });

    if (!post) return res.status(403).send("존재하지 않는 게시글입니다.");

    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10), // url의 동적으로 바뀌는 부분을 parameter라고 한다.
      UserId: req.user.id,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });

    res.status(201).json(fullComment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 좋아요 버튼 누름 : PATCH /post/1/like
router.patch("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) return res.send(403).send("게시글이 존재하지 않습니다.");
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 좋아요 버튼 취소 : DELETE /post/1/like
router.delete("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId } });
    if (!post) return res.send(403).send("게시글이 존재하지 않습니다.");
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 게시글 삭제
router.delete("/:postId", isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id, // 게시글 작성자가 본인일 때만 삭제 가능하다
      },
    });
    res.status(200).json({ PostId: Number(req.params.postId) });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 이미지 업로드

router.post(
  "/images",
  isLoggedIn,
  upload.array("image"), // 한 장만 올리고 싶으면 array대신 single
  async (req, res, next) => {
    // upload가 완료된 뒤에 (req,res,next)가 실행된다. req.files에는 이미지가 들어있다.
    res.json(req.files.map((v) => v.filename));
  }
);

//! 리트윗하기

router.post(`/:postId/retweet`, isLoggedIn, async (req, res, next) => {
  try {
    // 리트윗하려는 Post가 실제로 존재하는지 확인
    const post = await Post.findOne({
      where: { id: req.params.postId },
      // Retweet 속성 추가
      include: [
        {
          model: Post,
          as: "Retweet",
        },
      ],
    });

    if (!post) return res.status(403).send("존재하지 않는 게시글입니다.");

    // 자기 게시물을 리트윗하거나 OR 본인의 게시물을 리트윗한 다른 유저의 게시물을 본인이 리트윗
    if (
      req.user.id === post.UserId ||
      (post.Retweet && post.Retweet.UserId === req.user.id)
    ) {
      return res.status(403).send("자신의 글을 리트윗할 수 없습니다!");
    }

    const retweetTargetId = post.RetweetId || post.id;
    // 리트윗하려는 포스트가 다른 포스트을 리트윗한 포스트일 때 오리지널 포스트이 id를 가져온다

    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });

    if (exPost) {
      return res.status(403).send("이미 리트윗했습니다!");
    }

    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: "retweet",
    });

    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
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
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });
    res.status(201).json(retweetWithPrevPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//! 게시물 하나만 불러오기

router.get(`/:postId`, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [
        {
          model: Post,
          as: "Retweet",
        },
      ],
    });

    if (!post) return res.status(403).send("존재하지 않는 게시글입니다.");

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
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
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });

    if (!fullPost) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }

    res.status(201).json(fullPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
