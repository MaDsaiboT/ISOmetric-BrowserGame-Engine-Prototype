export function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

export function throttle2(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,  
        args = arguments;  
    if (last && now < last + threshhold) {  
      // hold on to it  
      clearTimeout(deferTimer);  
      deferTimer = setTimeout(function () {  
        last = now;  
        fn.apply(context, args);  
      }, threshhold + last - now);  
    } else {  
      last = now;  
      fn.apply(context, args);  
    }
  };
}

// create an itarable range of integers
// between start and end via generator
// can be used with the spread operator 
// [...range(1,3)] -> [1,2,3]
export function* range(start, end) {
  yield start;
  if (start === end) return;
  yield* range(start + 1, end);
}

//reverses a string (abcd -> dcba)
export const stringReverse = str => [...str].reverse().join('');

//reduce an array of strings to the highest string length
export const getMaxStringLength = arr => arr.reduce((r, c) => r.length >= c.length ? r.length : c.length);

