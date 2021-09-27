// const { DataTypes } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  // mySql에는 users로 테이블 생성된다.

  const Post = sequelize.define(
    "Post",
    {
      content: {
        type: DataTypes.TEXT, // 글자 제한x
        allowNull: false,
      },
      // PostId가 생성된다
    },
    {
      charset: "utf8mb4", // 이모티콘 사용하기 위해서는 mb4 추가
      collate: "utf8mb4_general_ci",
    }
  );

  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // Post <  작성자, post.addUser, post.getUser, post.setUser
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image); // post.addImages 메서도 생성된다
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" }); // post.addHashtags
    db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" });
    //? post.addLikers, post.removeLikers 메서드 생성된다
    // User <=> Post의 "좋아요" 관계
    // through는 Post와 User의 중간 테이블 / 다 : 다 관계인 경우 중간 테이블이 생성된다
    // 같은 관계가 중복으로 있을 경우, 구분을 위해서 as를 통해 다른 이름을 붙여준다
    db.Post.belongsTo(db.Post, { as: "Retweet" });
    // PostId를 RetweetId으로 이름을 바꿔준다
    // post.addRetweet
  };

  return Post;
};
