/** @format */

const createQuery = (...queries) => {
	let updatedQuery = {};
	for (query of queries) {
		updatedQuery = { ...updatedQuery, ...query };
	}
	return updatedQuery;
};

const defaultPaginationQuery = () => ({
	pageSize: 9,
	page: 1
});

const defaultCountryQuery = () => ({
	country: 'us'
});

module.exports = {
	createQuery,
	defaultPaginationQuery,
	defaultCountryQuery
};
