const math = {
  radsToDegs: rad => (rad * 180 / Math.PI),
  degsToRads: deg => (deg * Math.PI) / 180.0,

  rand_range: function (a, b) {
    return Math.random() * (b - a) + a;
  },

  rand_normalish: function () {
    const r = Math.random() + Math.random() + Math.random() + Math.random();
    return (r / 4.0) * 2.0 - 1;
  },

  rand_int: function(a, b) {
    return Math.round(Math.random() * (b - a) + a);
  },

  lerp: function (x, a, b) {
    return x * (b - a) + a;
  },

  clamp: function (x, a, b) {
    return Math.min(Math.max(x, a), b);
  },

  sat: function (x) {
    return Math.min(Math.max(x, 0.0), 1.0);
  },

  // normalize x to a value of 0 to 1 in relation to min and max
  normalize:(x,min,max) => (x - min) / (max - min) 
  
};

export default math
