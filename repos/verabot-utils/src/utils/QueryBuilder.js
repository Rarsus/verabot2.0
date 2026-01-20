/**
 * Query Builder Utility
 * Provides chainable API for building SQL queries
 */

class QueryBuilder {
  constructor() {
    this._select = '*';
    this._from = '';
    this._where = [];
    this._orderBy = '';
    this._limit = null;
    this._params = [];
  }

  /**
   * Set SELECT clause
   * @param {string|Array} columns - Columns to select
   * @returns {QueryBuilder} this
   */
  select(columns) {
    if (Array.isArray(columns)) {
      this._select = columns.join(', ');
    } else {
      this._select = columns;
    }
    return this;
  }

  /**
   * Set FROM clause
   * @param {string} table - Table name
   * @returns {QueryBuilder} this
   */
  from(table) {
    this._from = table;
    return this;
  }

  /**
   * Add WHERE condition
   * @param {string} condition - WHERE condition with ? placeholders
   * @param {*} value - Parameter value(s)
   * @returns {QueryBuilder} this
   */
  where(condition, value) {
    this._where.push(condition);
    if (value !== undefined) {
      if (Array.isArray(value)) {
        this._params.push(...value);
      } else {
        this._params.push(value);
      }
    }
    return this;
  }

  /**
   * Set ORDER BY clause
   * @param {string} orderBy - ORDER BY clause
   * @returns {QueryBuilder} this
   */
  orderBy(orderBy) {
    this._orderBy = orderBy;
    return this;
  }

  /**
   * Set LIMIT clause
   * @param {number} limit - Limit value
   * @returns {QueryBuilder} this
   */
  limit(limit) {
    this._limit = limit;
    return this;
  }

  /**
   * Build the SQL query
   * @returns {string} SQL query
   */
  build() {
    if (!this._from) {
      throw new Error('FROM clause is required');
    }

    let sql = `SELECT ${this._select} FROM ${this._from}`;

    if (this._where.length > 0) {
      sql += ` WHERE ${this._where.join(' AND ')}`;
    }

    if (this._orderBy) {
      sql += ` ORDER BY ${this._orderBy}`;
    }

    if (this._limit !== null) {
      sql += ` LIMIT ${this._limit}`;
    }

    return sql;
  }

  /**
   * Get bound parameters
   * @returns {Array} Parameters
   */
  getParams() {
    return this._params;
  }

  /**
   * Reset the builder
   * @returns {QueryBuilder} this
   */
  reset() {
    this._select = '*';
    this._from = '';
    this._where = [];
    this._orderBy = '';
    this._limit = null;
    this._params = [];
    return this;
  }
}

module.exports = QueryBuilder;
