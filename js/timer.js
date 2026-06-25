const timer = (() => {
  let _interval = null;
  let _seconds = 0;
  let _onTick = null;

  return {
    start(onTick) {
      this.reset();
      _onTick = onTick;
      _interval = setInterval(() => {
        _seconds++;
        if (_onTick) _onTick(_seconds);
      }, 1000);
    },
    stop() {
      clearInterval(_interval);
      _interval = null;
    },
    reset() {
      this.stop();
      _seconds = 0;
    },
    getSeconds() { return _seconds; }
  };
})();
