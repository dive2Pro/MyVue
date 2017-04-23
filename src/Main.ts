import {Observe} from './Observe'



var test = Observe(15)
console.log(test.data)

test.data = 14
console.log(test.data)
test.data = 11
console.log(test.data)
