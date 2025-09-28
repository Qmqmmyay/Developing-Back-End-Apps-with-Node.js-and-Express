let myPromise1 = new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve("Promise 1 resolved")
    },6000)})

let myPromise2 = new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve("Promise 2 resolved")
    },3000)})

  myPromise1
  .then(m1 => (console.log('From Callback ' + m1), myPromise2))
  .then(m2 =>  console.log('From Callback ' + m2));
