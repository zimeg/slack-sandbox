import Database from "../database/index.js";

export default class Count {
  /**
   * @type {Database}
   */
  db;

  /**
   * @constructor
   * @param {Database} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Retreive the total amount of clicks tallied.
   * @returns {Promise<number>} - a total count.
   */
  async get() {
    const sql = `
      SELECT MAX(id) as id
      FROM clicks
    `;
    const response = await this.db.pool.query(sql, []);
    if (!response.rows || response.rows.length <= 0) {
      throw new Error("Failed to count clicks");
    }
    return response.rows[0].id;
  }

  /**
   * Provide another click to count with totals.
   * @returns {Promise<number>} - the new total.
   */
  async post() {
    const sql = `
      INSERT INTO clicks (
        created_at,
        is_https,
        is_slack
      ) VALUES (
        $1,
        $2,
        $3
      ) RETURNING id`;
    const now = new Date();
    const values = [now.toISOString(), true, false];
    const response = await this.db.pool.query(sql, values);
    if (!response.rows || response.rows.length <= 0) {
      throw new Error("Failed to count click");
    }
    return response.rows[0].id;
  }
}
