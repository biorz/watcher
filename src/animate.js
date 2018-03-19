let RAF =
  window.requestAnimationFrame ||
  function(fn) {
    setTimeout(fn, 1000 / 60);
  };

let tween = {
  linear(t, b, c, d) {
    return t / d * c + b;
  },

  quad: {
    easeIn(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOut(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut(t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * (--t * (t - 2) - 1) + b;
    }
  }
};

export { 
  RAF, 
  
  tween 
};
