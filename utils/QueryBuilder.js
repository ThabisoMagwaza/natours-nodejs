module.exports = class QueryBuilder {
	constructor(queryObj, model) {
		this.excludes = ['limit', 'page', 'sort', 'fields'];
		this.queryObj = queryObj;
		this.query = model.find();
	}

	removeExcludes(obj) {
		const newObj = {...obj};
		this.excludes.forEach(el => delete newObj[el]);
		return newObj;
	}

	filter() {
		const filterObj = this.removeExcludes(this.queryObj);

		if(filterObj) {
			let queryObjString = JSON.stringify(filterObj);
			queryObjString = queryObjString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

			this.query = this.query.find(JSON.parse(queryObjString));
		}

		return this;
	}

	sort() {
		if(this.queryObj.sort) this.query = this.query.sort(this.queryObj.sort.replace(',', ' '));
		return this;
	}

	fields() {
		if(this.queryObj.fields) this.query = this.query.select(this.queryObj.fields.replace(',', ' '));
		return this;
	}

	limit() {
		const limit = this.queryObj.limit * 1 || 10;
		const page = this.queryObj.page * 1 || 1;

		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
};