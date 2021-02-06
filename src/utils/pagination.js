const perPage = () => 9;

const totalNumberOfPages = totalArticles => {
  return () => Math.ceil(totalArticles / perPage());
};

module.exports = {
  totalNumberOfPages
};