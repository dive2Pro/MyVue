import {asStruct, Observe} from './Observe'



// var test = Observe(15)
// console.log(test.data)

// test.data = 14
// console.log(test.data)
// test.data = 11
// console.log(test.data)

// const obj1 = Observe({age: 12, sex: 'man'})
// console.log(obj1)
// obj1.age = 13
// console.log(obj1)
// obj1.age = 13
// obj1.age = 15
// obj1.age = '130000'
// console.log(obj1.age)
// obj1.sex = 'haah'
// console.log(obj1.sex)

const oo = Observe(25);
const complicateObj = {
  age: 12,
  oo,
  favois: {song: '7ers', sport: 'ball', game: {name: 'dota2', year: 2012}}
};
// const cobj = Observe(complicateObj);

// console.log(cobj);

// cobj.favois.song = '6year';
// // console.log(cobj.favois.song);
// cobj.favois.game.name = '6year --';
// // console.log(cobj.favois.game.name);
// oo.data = 13
// console.log(complicateObj.oo.data)
// console.log(cobj.favois.game.year);
const structObj = {
  age: 26,
  favois: {song: '7ers', sport: 'ball', game: {name: 'dota2', year: 2012}}
}

const structJ = Observe(asStruct(structObj))
console.log(structJ)
// 不支持动态添加观察
structJ.haha = 'zou'
console.log('=============================')
structJ.age = {
  startYear: 1991,
  endYear: 2016
};
console.log(structJ, structJ.age)
// structJ.age.$watch(
// (cur, prev) => {console.log(`I'm now  ${cur} ,prev = ${prev}`)})
structJ.age.endYear = 1998;
console.log(structJ)
