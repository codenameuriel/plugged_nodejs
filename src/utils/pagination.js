const perPage = () => 9;

const calculateNumOfPages = totalArticles => {
  return (numOfArticles=perPage()) => Math.ceil(totalArticles / numOfArticles);
};

module.exports = {
  calculateNumOfPages
};