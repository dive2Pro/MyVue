import {Observe} from './Observe'



// var test = Observe(15)
// console.log(test.data)

// test.data = 14
// console.log(test.data)
// test.data = 11
// console.log(test.data)

const obj1 = Observe({age: 12, sex: 'man'})
console.log(obj1)
obj1.age = 13
console.log(obj1)
obj1.age = 13
obj1.age = 15
obj1.age = '130000'
console.log(obj1.age)
obj1.sex = 'haah'
console.log(obj1.sex)
