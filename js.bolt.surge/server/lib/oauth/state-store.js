import { neon } from "@neondatabase/serverless";

/**
 * Get a SQL query function connected to the database.
 * @returns {ReturnType<typeof neon>}
 */
function getSQL() {
  return neon(/** @type {string} */ (process.env.POSTGRES_URL));
}

/**
 * Database-backed state store for OAuth flow.
 * Implements @slack/oauth StateStore interface.
 */
export class DatabaseStateStore {
  /**
   * Generate and store a new state parameter with install options.
   * @param {import("@slack/oauth").InstallURLOptions} installOptions
   * @param {Date} now
   * @returns {Promise<string>}
   */
  async generateStateParam(installOptions, now) {
    const sql = getSQL();
    const state = crypto.randomUUID();
    // JSONB columns accept objects directly - no need to stringify
    await sql`INSERT INTO states (state, options, created_at)
              VALUES (${state}, ${installOptions}, ${now.toISOString()})`;
    return state;
  }

  /**
   * Verify and consume a state parameter, returning stored options.
   * @param {Date} now
   * @param {string} state
   * @returns {Promise<import("@slack/oauth").InstallURLOptions>}
   */
  async verifyStateParam(now, state) {
    const sql = getSQL();
    const minTime = new Date(now.getTime() - 60 * 10 * 1000).toISOString();

    const result =
      /** @type {{options: import("@slack/oauth").InstallURLOptions}[]} */ (
        await sql`DELETE FROM states
                WHERE state = ${state} AND created_at > ${minTime}
                RETURNING options`
      );

    if (result.length === 0) {
      throw new Error("Invalid or expired state");
    }
    // JSONB returns parsed object directly
    return result[0].options;
  }
}
