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