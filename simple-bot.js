let cache = {};

let data= {"role": "system", "content": "You are a helpful assistant."};
let data2= {"role": "system", "content": "You are a helpful assistant."};
let myArray = [data];
let key="phu_hns_123";
myArray.push(data2);
cache[key] =myArray;
let data3= {"role": "system", "content": "You are a helpful assistant."};
myArray.push(data3);
console.log(cache[key]);