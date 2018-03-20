export let getScrollParent = (() => {
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

export let getOffset = function(rect, rect2) {
  const width =
    Math.min(rect.right, rect2.right) - Math.max(rect.left, rect2.left);
  const height =
    Math.min(rect.bottom, rect2.bottom) - Math.max(rect.top, rect2.top);

  return width > 0 && height > 0
    ? ((rect.width = width), (rect.height = height), rect)
    : 0;
};
