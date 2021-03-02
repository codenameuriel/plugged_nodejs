const minToMilliSecs = min => {
  return min * 60 * 1000;
};

const hasTimeElapsed = (pastTime, currTime, interval) => {
  return pastTime.getTime() + minToMilliSecs(interval) >= currTime.getTime();
}

module.exports = {
  hasTimeElapsed
};
