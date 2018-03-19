let getScrollParent = (() => {
  const regex = /(auto|scroll)/;
  const scroll = ["overflow", "overflow-x", "overflow-y"];

  let style, parent;

  return function getParent(node) {
    try {
      style = getComputedStyle((parent = node.parentNode), null);
    } catch (e) {
      return null;
    }

    if (
      scroll.some(function(item) {
        return regex.test(style.getPropertyValue(item));
      })
    ) {
      return parent;
    }

    return getParent(parent);
  };
})();

let getOffset = function(r1, r2) {
  const w = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
  const h = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);

  return w > 0 && h > 0 ? ((r1.width = w), (r1.height = h), r1) : 0;
};

let getScrollParentItera = (el, callback) => {
  let rsts = [],
    nodes = [getScrollParent(el)],
    parent,
    cur,
    rst;

  while ((cur = curnodes.shift())) {
    parent = getScrollParent(cur);

    rst = callback.call(null, cur, parent);

    if (!rst) {
      return rsts;
    }

    rsts.push(rst);
    nodes.push(parents);
  }

  return rst;
};

export { getScrollParent, getOffset };
