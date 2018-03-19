class emit {
  constructor() {
    this._events = {};
  }

  on(type, callback) {
    if (!this._events[type]) {
      this._events[type] = [];
    }

    this._events[type].push(callback);
    return this;
  }

  one(type, callback) {
    if (!this._events[type]) {
      this._events[type] = [];
    }

    let self = this;

    let once = function() {
      let argus = [].slice.call(arguments);

      if (callback.apply(self, argus) === true) {
        self.remove(type, once);
      }
    };
    this.on(type, once);
    return this;
  }

  emit(type) {
    let types = type.split(" "),
      argus = [].slice.call(arguments, 1);

    types.forEach(type => {
      if (!this._events[type]) {
        return;
      }

      this._events[type].forEach(callback => {
        callback.apply(this, argus);
      });
    });
  }

  remove(type, callback) {
    if (!this._events[type]) {
      return;
    }

    this._events[type].forEach((cb, i) => {
      if (callback === cb) {
        this._events[type].splice(i, 1);
        return false;
      }
    });
  }
}

export default emit;
