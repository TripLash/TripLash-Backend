class APIFeatures {
    constructor(query, queryString) {
      this.query = query; // query = Tour.find() (model)
      this.queryString = queryString; // queryString = req.query (main query)
    }
  
    Filter() {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);
  
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
  
      this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    Sorting() {
      if (this.queryString.sort) {
        const sortField = this.queryString.sort.split(',').join(' ') || 'createdAt';
        // this.query = this.query.sort(sortBy);
        const sortOrder = this.queryString.sort.sortOrder || 'desc';
        this.query = this.query.sort({ [sortField]: sortOrder });
      } 
      // else {
      //   this.query = this.query.sort('-createdAt');
      // }
      
  
      return this;
    }
  
    LimitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    Pagination() {
      const limit = this.queryString.limit * 1 || 10;
      const page = this.queryString.page * 1 || 1;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports = APIFeatures;