const { DataTypes } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  // mySql에는 users로 테이블 생성된다

  const User = sequelize.define(
    "User",
    {
      email: {
        type: DataTypes.STRING(30), // email 글자 제한
        allowNull: false, // false => 필수 true => 필수X
        unique: true, // 고유한 값이어야 한다.
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // id는 mySql에서 자동으로 만들어준다
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci", // 한글 사용할 수 있게 해준다
    }
  );

  User.associate = (db) => {
    db.User.hasMany(db.Post); // User가 Post를 여러 개 가질 수 있다
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: "Like", as: "Liked" });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers",
      foreignKey: "followingId", // follower를 찾기 위해서는 following을 먼저 찾아야한다
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "followerId", // 반대로 누구를 팔로잉하는지 알려면, 팔로워의 id를 먼저 찾아야한다
    });
    // foreignKey의 역할: 위 상황은 User와 User 같은 테이블 끼리의 관계이다. 두 개를 구분하기 위해서
    // 중간테이블에서의 key 이름을 하나는 followingId으로, 나머지 하나는 followerId으로 바꿔준다.
  };

  return User;
};
