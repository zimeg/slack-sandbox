import { neon } from "@neondatabase/serverless";

/**
 * Get a SQL query function connected to the database.
 * @returns {ReturnType<typeof neon>}
 */
function getSQL() {
  return neon(process.env.POSTGRES_URL);
}

/**
 * @typedef {Object} Database
 * @property {Function} load - Initialize database tables
 * @property {Function} query - Run a raw SQL query
 * @property {Function} getMessageCount - Get total message count
 * @property {Function} getMessageCountBySource - Get message counts by source
 * @property {Function} incrementMessageCount - Increment message counter
 * @property {Function} getBalance - Get credit balance for team/enterprise
 * @property {Function} getUsageCount - Get usage count for team/enterprise
 * @property {Function} grantStarterCredits - Grant initial credits on install
 * @property {Function} grantBonusCredit - Grant a bonus credit
 * @property {Function} deductCredit - Deduct credit and log usage
 */

/**
 * Initialize database tables, dropping existing ones first in dev.
 */
async function load() {
  const sql = getSQL();

  // Drop all tables for fresh schema in local development only
  if (!process.env.VERCEL_ENV) {
    await sql`DROP TABLE IF EXISTS transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS installations CASCADE`;
    await sql`DROP TABLE IF EXISTS states CASCADE`;
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    console.log("Dropped existing tables");
  }

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      source VARCHAR(20) DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Table 'messages' ready");

  await sql`
    CREATE TABLE IF NOT EXISTS states (
      state VARCHAR(255) PRIMARY KEY,
      options JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Table 'states' ready");

  await sql`
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
    )
  `;
  console.log("Table 'installations' ready");

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      team_id VARCHAR(20),
      enterprise_id VARCHAR(20),
      type VARCHAR(20) NOT NULL,
      amount INTEGER NOT NULL,
      input_tokens INTEGER,
      output_tokens INTEGER,
      total_tokens INTEGER,
      model VARCHAR(50),
      reference_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Table 'transactions' ready");
}

/**
 * Run a raw SQL query.
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 */
async function query(strings, ...values) {
  const sql = getSQL();
  return sql(strings, ...values);
}

/**
 * Get total message count.
 * @returns {Promise<number>}
 */
async function getMessageCount() {
  const sql = getSQL();
  const result = await sql`SELECT COUNT(*) as count FROM messages`;
  return parseInt(result[0]?.count ?? "0", 10);
}

/**
 * Get message counts by source.
 * @returns {Promise<{total: number, web: number, slack: number}>}
 */
async function getMessageCountBySource() {
  const sql = getSQL();
  const result = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE source = 'web') as web,
      COUNT(*) FILTER (WHERE source = 'slack') as slack
    FROM messages
  `;
  const row = result[0];
  return {
    total: parseInt(row?.total ?? "0", 10),
    web: parseInt(row?.web ?? "0", 10),
    slack: parseInt(row?.slack ?? "0", 10),
  };
}

/**
 * Increment message counter.
 * @param {string} [source='web'] - Source of the message ('web' or 'slack')
 * @returns {Promise<number>}
 */
async function incrementMessageCount(source = "web") {
  const sql = getSQL();
  await sql`INSERT INTO messages (source) VALUES (${source})`;
  return getMessageCount();
}

/**
 * Get credit balance for a team or enterprise.
 * @param {Object} params
 * @param {string | undefined} params.teamId
 * @param {string | undefined} params.enterpriseId
 * @returns {Promise<number>}
 */
async function getBalance({ teamId, enterpriseId }) {
  const sql = getSQL();
  const result = enterpriseId
    ? await sql`SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE enterprise_id = ${enterpriseId}`
    : await sql`SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE team_id = ${teamId} AND enterprise_id IS NULL`;
  return parseInt(result[0]?.balance ?? "0", 10);
}

/**
 * Grant starter credits on install.
 * @param {Object} params
 * @param {string | undefined} params.teamId
 * @param {string | undefined} params.enterpriseId
 * @param {number} [params.amount]
 */
async function grantStarterCredits({ teamId, enterpriseId, amount = 50 }) {
  const sql = getSQL();
  await sql`
    INSERT INTO transactions (team_id, enterprise_id, type, amount)
    SELECT ${teamId}, ${enterpriseId ?? null}, 'starter', ${amount}
    WHERE NOT EXISTS (
      SELECT 1 FROM transactions
      WHERE (enterprise_id = ${enterpriseId} OR (team_id = ${teamId} AND enterprise_id IS NULL))
      AND type = 'starter'
    )
  `;
}

/**
 * Get usage count for a team or enterprise.
 * @param {Object} params
 * @param {string | undefined} params.teamId
 * @param {string | undefined} params.enterpriseId
 * @returns {Promise<number>}
 */
async function getUsageCount({ teamId, enterpriseId }) {
  const sql = getSQL();
  if (enterpriseId) {
    const result = await sql`
      SELECT COUNT(*) as count FROM transactions
      WHERE enterprise_id = ${enterpriseId} AND type = 'usage'
    `;
    return parseInt(result[0]?.count ?? "0", 10);
  }
  const result = await sql`
    SELECT COUNT(*) as count FROM transactions
    WHERE team_id = ${teamId} AND enterprise_id IS NULL AND type = 'usage'
  `;
  return parseInt(result[0]?.count ?? "0", 10);
}

/**
 * Deduct a credit and log usage transaction.
 * @param {Object} params
 * @param {string | undefined} params.teamId
 * @param {string | undefined} params.enterpriseId
 * @param {string} params.model
 * @param {number} params.inputTokens
 * @param {number} params.outputTokens
 * @param {number} params.totalTokens
 * @param {string} params.referenceId
 * @returns {Promise<boolean>} true if deducted, false if insufficient balance
 */
async function deductCredit({
  teamId,
  enterpriseId,
  model,
  inputTokens,
  outputTokens,
  totalTokens,
  referenceId,
}) {
  const balance = await getBalance({ teamId, enterpriseId });
  if (balance <= 0) {
    return false;
  }
  const sql = getSQL();
  await sql`
    INSERT INTO transactions (team_id, enterprise_id, type, amount, input_tokens, output_tokens, total_tokens, model, reference_id)
    VALUES (${teamId}, ${enterpriseId ?? null}, 'usage', -1, ${inputTokens}, ${outputTokens}, ${totalTokens}, ${model}, ${referenceId})
  `;
  return true;
}

/**
 * Grant a bonus credit.
 * @param {Object} params
 * @param {string | undefined} params.teamId
 * @param {string | undefined} params.enterpriseId
 * @returns {Promise<number>} new balance
 */
async function grantBonusCredit({ teamId, enterpriseId }) {
  const sql = getSQL();
  await sql`
    INSERT INTO transactions (team_id, enterprise_id, type, amount)
    VALUES (${teamId}, ${enterpriseId ?? null}, 'bonus', 1)
  `;
  return getBalance({ teamId, enterpriseId });
}

/** @type {Database} */
export const db = {
  load,
  query,
  getMessageCount,
  getMessageCountBySource,
  incrementMessageCount,
  getBalance,
  getUsageCount,
  grantStarterCredits,
  grantBonusCredit,
  deductCredit,
};
