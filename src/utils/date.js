const minToMilliSecs = min => {
  return min * 60 * 1000;
};

const checkTime = (pastTime, interval) => {
  const now = new Date();
  return (now.getTime() - pastTime) >= minToMilliSecs(interval);
};

module.exports = {
  checkTime
};
