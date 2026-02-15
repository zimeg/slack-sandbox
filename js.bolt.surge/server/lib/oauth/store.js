import { neon } from "@neondatabase/serverless";

/**
 * Get a SQL query function connected to the database.
 * @returns {ReturnType<typeof neon>}
 */
function getSQL() {
  return neon(process.env.POSTGRES_URL);
}

/**
 * Database-backed installation store for OAuth.
 */
export default class Store {
  /**
   * @typedef {Object} Scan
   * @property {number} id
   * @property {import("@slack/oauth").Installation<"v2", boolean>} installation
   */

  /**
   * @typedef {Object} Ticket
   * @property {number} id
   * @property {Date} created_at
   * @property {Date | undefined} updated_at
   * @property {Date | undefined} deleted_at
   * @property {string | undefined} team_id
   * @property {string | undefined} team_name
   * @property {string | undefined} enterprise_id
   * @property {string | undefined} enterprise_name
   * @property {string} user_id
   * @property {string | undefined} user_token
   * @property {string[] | undefined} user_scopes
   * @property {string | undefined} token_type
   * @property {boolean} is_enterprise_install
   * @property {string} app_id
   * @property {string} auth_version
   * @property {string[] | undefined} bot_scopes
   * @property {string | undefined} bot_token
   * @property {string | undefined} bot_user_id
   * @property {string | undefined} bot_id
   */

  /**
   * @param {import("../database/index.js").Database} db
   */
  db;

  /**
   * @constructor
   * @param {import("../database/index.js").Database} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Write the newest installation to the store.
   * @param {import("@slack/oauth").Installation} installation
   */
  async create(installation) {
    const sql = getSQL();
    const now = new Date().toISOString();
    await sql`
      INSERT INTO installations (
        created_at,
        team_id,
        team_name,
        enterprise_id,
        enterprise_name,
        user_id,
        user_token,
        user_scopes,
        token_type,
        is_enterprise_install,
        app_id,
        auth_version,
        bot_scopes,
        bot_token,
        bot_user_id,
        bot_id
      ) VALUES (
        ${now},
        ${installation.team?.id ?? null},
        ${installation.team?.name ?? null},
        ${installation.enterprise?.id ?? null},
        ${installation.enterprise?.name ?? null},
        ${installation.user.id},
        ${installation.user?.token ?? null},
        ${installation.user?.scopes ?? null},
        ${installation.tokenType ?? null},
        ${installation.isEnterpriseInstall ?? false},
        ${installation.appId ?? null},
        ${installation.authVersion ?? "v2"},
        ${installation.bot?.scopes ?? null},
        ${installation.bot?.token ?? null},
        ${installation.bot?.userId ?? null},
        ${installation.bot?.id ?? null}
      )
    `;
    await this.db.grantStarterCredits({
      teamId: installation.team?.id,
      enterpriseId: installation.isEnterpriseInstall
        ? installation.enterprise?.id
        : undefined,
    });
  }

  /**
   * Retrieve saved installations matching the lookup query.
   * @param {import("@slack/oauth").InstallationQuery<boolean>} lookup
   * @returns {Promise<Scan[]>}
   */
  async read(lookup) {
    const sql = getSQL();
    /** @type {Ticket[]} */
    let result;
    if (!lookup.userId) {
      result = await sql`
        SELECT *
        FROM installations
        WHERE
          (enterprise_id IS NULL OR enterprise_id = ${lookup.enterpriseId ?? null}) AND
          (team_id IS NULL OR team_id = ${lookup.teamId ?? null}) AND
          deleted_at IS NULL
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
    } else {
      result = await sql`
        SELECT *
        FROM installations
        WHERE
          (enterprise_id IS NULL OR enterprise_id = ${lookup.enterpriseId ?? null}) AND
          (team_id IS NULL OR team_id = ${lookup.teamId ?? null}) AND
          (user_id IS NULL OR user_id = ${lookup.userId}) AND
          deleted_at IS NULL
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
    }
    return result.map((ticket) => ({
      id: ticket.id,
      installation: {
        team: dbToInstallationTeam(ticket),
        enterprise: dbToInstallationEnterprise(ticket),
        user: dbToInstallationUser(ticket),
        tokenType: dbToInstallationTokenType(ticket),
        isEnterpriseInstall: ticket.is_enterprise_install,
        appId: ticket.app_id,
        authVersion: dbToInstallationAuthVersion(ticket),
        bot: dbToInstallationBot(ticket),
      },
    }));
  }

  /**
   * Refresh the latest installation with updated information.
   * @param {import("@slack/oauth").Installation} installation
   */
  async update(installation) {
    const sql = getSQL();
    const now = new Date().toISOString();
    await sql`
      UPDATE installations
      SET
        updated_at = ${now},
        team_name = ${installation.team?.name ?? null},
        enterprise_name = ${installation.enterprise?.name ?? null},
        user_token = ${installation.user?.token ?? null},
        user_scopes = ${installation.user?.scopes ?? null},
        token_type = ${installation.tokenType ?? null},
        is_enterprise_install = ${installation.isEnterpriseInstall ?? false},
        app_id = ${installation.appId ?? null},
        auth_version = ${installation.authVersion ?? "v2"},
        bot_scopes = ${installation.bot?.scopes ?? null},
        bot_token = ${installation.bot?.token ?? null},
        bot_user_id = ${installation.bot?.userId ?? null},
        bot_id = ${installation.bot?.id ?? null}
      WHERE
        team_id = ${installation.team?.id ?? null} AND
        enterprise_id = ${installation.enterprise?.id ?? null} AND
        user_id = ${installation.user.id}
    `;
  }
}

/**
 * @typedef {"v2"} AuthVersion
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {AuthVersion | undefined}
 */
function dbToInstallationAuthVersion(ticket) {
  if (ticket.auth_version !== "v2") {
    return undefined;
  }
  return ticket.auth_version;
}

/**
 * @typedef {Object} Bot
 * @property {string} id
 * @property {string[]} scopes
 * @property {string} token
 * @property {string} userId
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {Bot | undefined}
 */
function dbToInstallationBot(ticket) {
  if (!ticket.bot_id) {
    return undefined;
  }
  if (!ticket.bot_scopes || !ticket.bot_token || !ticket.bot_user_id) {
    throw new Error(
      `Missing bot installation details for bot ID ${ticket.bot_id}`,
    );
  }
  return {
    id: ticket.bot_id,
    scopes: ticket.bot_scopes,
    token: ticket.bot_token,
    userId: ticket.bot_user_id,
  };
}

/**
 * @typedef {Object} Enterprise
 * @property {string} id
 * @property {string | undefined} name
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {Enterprise | undefined}
 */
function dbToInstallationEnterprise(ticket) {
  if (!ticket.enterprise_id) {
    return undefined;
  }
  return {
    id: ticket.enterprise_id,
    name: ticket.enterprise_name ?? undefined,
  };
}

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string | undefined} name
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {Team | undefined}
 */
function dbToInstallationTeam(ticket) {
  if (!ticket.team_id) {
    return undefined;
  }
  return {
    id: ticket.team_id,
    name: ticket.team_name ?? undefined,
  };
}

/**
 * @typedef {"bot"} TokenType
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {TokenType | undefined}
 */
function dbToInstallationTokenType(ticket) {
  if (ticket.token_type !== "bot") {
    return undefined;
  }
  return ticket.token_type;
}

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string[] | undefined} scopes
 * @property {string | undefined} token
 */

/**
 * @param {Store["Ticket"]} ticket
 * @returns {User}
 */
function dbToInstallationUser(ticket) {
  return {
    id: ticket.user_id,
    scopes: ticket.user_scopes ?? undefined,
    token: ticket.user_token ?? undefined,
  };
}
