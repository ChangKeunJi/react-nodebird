function Human(name) {
  this.name = name;
}

Human.prototype.sayName = function () {
  console.log("안녕 " + this.name);
};

const chulsoo = new Human("철수");
const younghee = new Human("영희");

console.log(chulsoo);
// Human { name: '철수' }

chulsoo.sayName();

console.log(younghee);
// Human { name: '영희' }
