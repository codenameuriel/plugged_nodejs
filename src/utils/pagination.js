const perPage = () => 9;

const totalNumberOfPages = totalArticles => {
  return (numOfArticles=perPage()) => Math.ceil(totalArticles / numOfArticles);
};

module.exports = {
  totalNumberOfPages
};