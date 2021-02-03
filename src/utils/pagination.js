const totalNumberOfPages = (totalArticles, perPage) => {
  return Math.ceil(totalArticles / perPage);
};

const perPage = () => { return 9; };

module.exports = {
  totalNumberOfPages,
  perPage
};