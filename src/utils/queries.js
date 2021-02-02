const updateQueries = (...defaultQueries) => {
  let queries = {};
  for (q of defaultQueries) {
    queries = {...queries, ...q};
  }
  return queries;
};

const defaultPaginationQueries = () => ({
  pageSize: 9,
  page: 1
});

const defaultCountryQuery = () => ({
  country: "us"
});

module.exports = {
  updateQueries,
  defaultPaginationQueries,
  defaultCountryQuery
};