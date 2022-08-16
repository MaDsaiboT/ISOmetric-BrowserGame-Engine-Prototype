const math = {
  radsToDegs: rad => (rad * 180 / Math.PI),
  degsToRads: deg => (deg * Math.PI) / 180.0,


  rand_range: (a, b) => Math.random() * (b - a) + a,

  rand_normalish: () => {
    const r = Math.random() + Math.random() + Math.random() + Math.random();
    return (r / 4.0) * 2.0 - 1;
  },

  rand_int: (a, b) => Math.round(Math.random() * (b - a) + a),



  clamp: (x, a, b) => Math.min(Math.max(x, a), b),

  sat: (x) => Math.min(Math.max(x, 0.0), 1.0),

  // normalize x to a value of 0 to 1 in relation to min and max
  normalize:(x,min,max) => (x - min) / (max - min), 
  
  //tweening functions


  lerp: (x,a,b) =>  x * (b - a) + a,

  // t time normalized
  // s start
  // c change 
  easeInQuad: (t,s,c) => c * t * t + s,

  easeOutQuad: (t,b,s) => -c*t*(t-2) +s,
};

export { math };
export default math;
