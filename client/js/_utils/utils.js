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
export const getMaxStringLength = arr => {
  let max = 0;
  arr.map(str => max = Math.max(str.length, max));
  return max;
};


export const easeTo = (position, targetPos, ease=0.05) => {
  const dx = targetPos.x - position.x;
  const dy = targetPos.y - position.y;
  position.x += dx * ease;
  position.y += dy * ease;
  if ( Math.abs(dx) < 0.05 &&
       Math.abs(dy) < 0.05
  ) {
    position.x = targetPos.x;
    position.y = targetPos.y;
  }
};

export function calcDistance(p1, p2) {
  let a = p1.x - p2.x;
  let b = p1.y - p2.y;
  return Math.sqrt(a * a + b * b);
}