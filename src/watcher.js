import emit from "./emit";
import { RAF, tween } from "./animate";
import { getOffset, getScrollParent } from "./dom";

const group = { interval: 1000 / 60, list: [] };

const throttle = function(fn) {
  let ban = false;

  return function() {
    if (ban) return;
    ban = true;

    setTimeout(() => {
      fn.apply(null, [].slice.call(arguments));
      ban = false;
    }, group.interval);
  };
};

const check = throttle(e => {
  group.list.forEach(selector => {
    group[selector].emit("re", e);
  });
});

const listens = ["scroll", "resize", "load"];
listens.forEach(event => {
  addEventListener(event, check);
});

const def = {
  wrapper: "html",
  proportion: { dir: 1, size: 1, select: 1, ratio: 1 },
  offset: { top: 0, right: 0, bottom: 0, left: 0 },
  threshold: 0,
  direction: 0,

  test: function(inview) {
    return inview;
  }
};

const axis = {
  coordinate: [0, 0],
  offset: ["offsetTop", "offsetLeft"],
  scrollOffset: ["scrollTop", "scrollLeft"],
  scrollLength: ["scrollHeight", "scrollWidth"],
  direction: ["top", "right", "bottom", "left"],
  length: ["vh", "vw"],
  start: ["top", "left"],
  end: ["bottom", "right"],
  side: ["height", "width"]
};

class watcher extends emit {
  constructor(selector, options) {
    super();

    if (typeof selector !== "string") return;

    let index = group.list.indexOf(selector);
    if (~index) return group[group.list[index]];

    group.list.push(selector);
    group[selector] = this;

    this.elements = [].slice.call(document.querySelectorAll(selector));
    this.options = Object.assign(def, options || {});

    this.init();
  }

  init() {
    this.current = [];
    this.views = [];

    this.offset();
    this.threshold();
    this.direction();
    this.proportion();

    this.isHozi = this.options.direction % 2;
    this.isEnd = (this.options.direction + 3) % 3;

    this.html = document.querySelector("html");

    this.preCalculate();
    this.onEvent();
  }

  onEvent() {
    let self = this,
      history = [];

    this.on("re", e => {
      if (e.type !== "scroll") {
        this.preCalculate();
      }

      this.check();
    });

    this.elements.forEach(element => {
      (function itera(el) {
        if (!(parent = getScrollParent(el))) return;

        if (!~history.indexOf(parent)) {
          history.push(parent);
          parent.addEventListener("scroll", e => {
            self.check();
          });

          itera(parent);
        }
      })(element);
    });
  }

  check() {
    this.views = [];

    this.elements.forEach(el => {
      let passed = this.inView(el),
        index = this.current.indexOf(el),
        enter = passed && !~index,
        exit = !passed && ~index;

      if (passed) this.views.push(passed);
      if (enter) this.emit("change enter", el);
      if (exit) this.emit("change exit", el);
    });

    this.sortBy(this.views);

    this.current = this.views.map(o => o.element);
    this.emit("check", this.current[0], this.current, this.views);
    this.current.length
      ? this.emit("has", this.current[0], this.current, this.views)
      : this.emit("none");
  }

  offset() {
    let o = this.options.offset;
    let offset = {};
    const isNum = n => typeof n === "number";
    ["top", "right", "bottom", "left"].forEach(
      isNum(o)
        ? dim => (offset[dim] = o)
        : dim => (offset[dim] = isNum(o[dim]) ? o[dim] : null)
    );
    this.options.offset = offset;
  }

  threshold() {
    let n = this.options.threshold;
    this.options.threshold =
      typeof n === "number" && n >= 0 && n <= 1 ? n : null;
  }

  direction() {
    let d = this.options.direction;
    let idx;
    this.options.direction =
      typeof d === "number"
        ? d
        : ~(idx = axis.direction.indexOf[d]) ? idx : null;
  }

  proportion() {
    let p = this.options.proportion;

    for (let k in p) {
      this.options.proportion[k] = typeof p[k] === "number" ? p[k] : null;
    }
  }

  preCalculate() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.vs = this.vw * this.vh;

    let offset = this.getOffset(this.vw, this.vh);
    this.vp = {
      top: offset.top,
      right: this.vw - offset.right,
      bottom: this.vh - offset.bottom,
      left: offset.left,
      width: this.vw - offset.left - offset.right,
      height: this.vh - offset.top - offset.bottom
    };
  }

  scroll(element, time) {
    this.select = element;
    this.scrollTo(element, time);

    this.one("exit", el => {
      if (this.select !== el) return false;
      this.select = null;
      return true;
    });
  }

  scrollTo(element, time) {
    this.isScrollTo = true;

    const end = () => {
      this.isScrollTo = true;
      this.check();
    };

    let history = [],
      parent = null,
      rect = element.getBoundingClientRect(),
      scroll,
      self = this;

    (function itera(el) {
      if (!(parent = getScrollParent(el))) {
        scroll = self.getScroll(rect, self.vp, self.html);
        return history.push(scroll);
      }

      let r1 = rect,
        r2 = parent.getBoundingClientRect();

      scroll = self.getScroll(r1, r2, parent);

      rect = {
        top: scroll.offset[1],
        left: scroll.offset[0],
        width: r1.width,
        height: r1.height
      };

      history.push(scroll);

      itera(parent);
    })(element);

    history.forEach(scroll => {
      let wrapper = scroll.element,
        dist = scroll.dist,
        start = scroll.start,
        distance = scroll.distance,
        max = scroll.max;

      if (!time) {
        wrapper.scroll(dist[0], dist[1]);
        end();
      } else {
        [0, 1].forEach(i => {
          let t = 0,
            timer;

          timer = RAF(function step() {
            wrapper[axis.scrollOffset[i]] = tween.quad.easeInOut(
              t,
              start[1 - i],
              distance[1 - i],
              time
            );
            t += 1000 / 60;

            if (
              t >= time ||
              (dist[1 - i] <= 0 && start[1 - i] <= 0) ||
              (dist[1 - i] >= max[1 - i] && start[1 - i] >= max[1 - i])
            )
              return end();
            timer = RAF(step);
          });
        });
      }
    });
  }

  getScroll(r1, r2, element) {
    let start = [],
      dist = [],
      max = [],
      distance = [],
      offset = [];

    [0, 1].forEach(i => {
      max[i] = element[axis.scrollLength[1 - i]] - r2[axis.side[1 - i]];
      offset[i] =
        r2[axis.start[1 - i]] +
        (this.isEnd ? r2[axis.side[1 - i]] - r1[axis.side[1 - i]] : 0);
      start[i] = element[axis.scrollOffset[1 - i]];
      distance[i] = r1[axis.start[1 - i]] - offset[i];
      dist[i] = element[axis.scrollOffset[1 - i]] + distance[i];

      if (dist[i] > max[i]) {
        distance[i] -= dist[i] - max[i];
        dist[i] = max[i];
        offset[i] += dist[i] - max[i];
      }
    });

    return {
      dist,
      offset,
      start,
      distance,
      max,
      element
    };
  }

  getOffset(width, height, dir) {
    const threshold = {
      width: this.options.threshold * width,
      height: this.options.threshold * height
    };

    const offset = {
      top: this.options.offset.top + threshold.height,
      right: this.options.offset.right + threshold.width,
      bottom: this.options.offset.bottom + threshold.height,
      left: this.options.offset.left + threshold.width
    };

    return dir !== undefined ? offset[dir] : offset;
  }

  sortBy(arr) {
    let proportion = this.options.proportion;

    return arr.sort((a, b) => {
      let x = this.isHozi,
        y = this.isEnd;

      const getDir = o => {
        let dir = !y ? this[axis.length[x]] - o[axis.start[x]] : o[axis.end[x]];

        return dir / this[axis.length[x]];
      };

      const getWight = o => {
        let select = o.element === this.select ? proportion.select : 0;

        return (
          getDir(o) * proportion.dir +
          o.size / this.vs * proportion.size +
          o.size / o.rawSize * proportion.ratio +
          select
        );
      };

      if (getWight(a) > getWight(b)) {
        return -1;
      }
      return 1;
    });
  }

  inView(element) {
    let parent,
      rect = element.getBoundingClientRect(),
      self = this;

    (function itera(el) {
      if (!rect) return;
      if (!(parent = getScrollParent(el)))
        return (rect = getOffset(rect, self.vp));

      rect = getOffset(rect, parent.getBoundingClientRect());
      return itera(parent);
    })(element);

    if (rect) {
      let raw = element.getBoundingClientRect();
      rect.rawSize = raw.width * raw.height;
      rect.size = rect.width * rect.height;
      rect.element = element;
    }
    return rect;
  }
}

watcher.setInterval = iv => {
  group.interval = iv;
};

export default (selector, options) => {
  return new watcher(selector, options);
};
