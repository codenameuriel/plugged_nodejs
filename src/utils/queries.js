const updateQueries = (...defaultQueries) => {
  let queries = {};
  for (query of defaultQueries) {
    queries = {...queries, ...query};
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