const updateQueries = defaultQueries => {
  return userQueries => ({
    ...defaultQueries,
    ...userQueries
  });
};

const defaultTopNewsQueries = () => ({
  country: "us",
  pageSize: 9,
  page: 1
});

module.exports = {
  updateQueries,
  defaultTopNewsQueries
};