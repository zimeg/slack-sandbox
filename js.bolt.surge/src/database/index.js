import pg from "pg";
import Dotenv from "../config/dotenv.js";

export default class Database {
  /**
   * @type {import("pg").Pool}
   */
  pool;

  /**
   * @param {Dotenv} env
   */
  constructor(env) {
    this.pool = new pg.Pool({
      connectionString: env.vars.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async load() {
    const clicks = `
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        is_https BOOLEAN NOT NULL,
        is_slack BOOLEAN NOT NULL,
        app_id VARCHAR(20),
        enterprise_id VARCHAR(20),
        team_id VARCHAR(20),
        user_id VARCHAR(20),
        is_enterprise_install BOOLEAN
      );
    `;
    try {
      await this.pool.query(clicks);
      console.log("Table 'clicks' created successfully");
    } catch (err) {
      console.error("Error creating 'clicks' table:", err);
    }
    const installations = `
      CREATE TABLE IF NOT EXISTS installations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        team_id VARCHAR(20),
        team_name VARCHAR(255),
        enterprise_id VARCHAR(20),
        enterprise_name VARCHAR(255),
        user_id VARCHAR(20) NOT NULL,
        user_token VARCHAR(255),
        user_scopes TEXT[],
        token_type VARCHAR(20),
        is_enterprise_install BOOLEAN NOT NULL,
        app_id VARCHAR(20) NOT NULL,
        auth_version VARCHAR(10) NOT NULL,
        bot_scopes TEXT[],
        bot_token VARCHAR(255),
        bot_user_id VARCHAR(20),
        bot_id VARCHAR(20)
      );
    `;
    try {
      await this.pool.query(installations);
      console.log("Table 'installations' created successfully");
    } catch (err) {
      console.error("Error creating 'intallations' table:", err);
    }
  }
}
