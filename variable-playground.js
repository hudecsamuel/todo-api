// var person = {
//   name: 'Samuel',
//   age: 23
// };
//
// function updatePerson(obj){
//   // obj = {
//   //   name: 'Samuel',
//   //   age: 21
//   // };
//
//   obj.age = 21;
// }
//
// updatePerson(person);
//
// console.log(person);

//array example
var grades = [1,4,2,5,2,1];

function updateArray(array, value){
  // array = [2,3,4,3,2,4,2];
  array.push(value);
  debugger;
}

updateArray(grades, 4);

console.log(grades);
