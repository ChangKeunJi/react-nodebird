const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // UserId: ...,
      // PostId: ...
      // belongsTo를 넣어주면 관계가 있는 데이터를 자동으로 만들어준다.
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    }
  );

  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  };

  return Comment;
};
