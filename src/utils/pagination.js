/** @format */

const perPage = () => 9;

const calculateNumOfPages = totalArticles => {
	return (numOfArticles = perPage()) => {
		const totalPages = Math.ceil(totalArticles / numOfArticles);
		// developer plan for news api allow up to 100 articles
		// page 12 would result in 108 results (not allowed)
		return totalPages > 11 ? 11 : totalPages;
	};
};

module.exports = {
	perPage,
	calculateNumOfPages
};
