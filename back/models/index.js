const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
// node와 mysql를 연결해준다.

const comment = require("./comment")(sequelize, Sequelize);
const hashtag = require("./hashtag")(sequelize, Sequelize);
const image = require("./image")(sequelize, Sequelize);
const post = require("./post")(sequelize, Sequelize);
const user = require("./user")(sequelize, Sequelize);

db.Comment = comment;
db.Hashtag = hashtag;
db.Image = image;
db.Post = post;
db.User = user;

// 반복문 돌면서 각 테이블의 associate를 호출한다
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
