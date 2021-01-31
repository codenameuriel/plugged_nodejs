const updateQueries = defaultQueries => {
  return userQueries => ({
    ...defaultQueries,
    ...userQueries
  });
};

const defaultQueries = () => ({
  country: "us",
  pageSize: 9,
  page: 1 
});

// const defaultTopNewsQueries = () => ({
//   ...defaultQueries()
// });

// const defaultCategoryNewsQueries = category => ({
//   ...defaultQueries(),
//   [category]: category
// });

module.exports = {
  updateQueries,
  defaultQueries,
};