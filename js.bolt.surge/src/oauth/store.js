import oauth from "@slack/oauth";
import Database from "../database/index.js";

export default class Store {
  /**
   * The unique ID of an installation object from a ticket.
   * @typedef Scan
   * @prop {number} id
   * @prop {oauth.Installation<"v2", boolean>} installation
   */

  /**
   * Installation information saved to the database.
   * @typedef Ticket
   * @prop {number} id
   * @prop {Date} created_at
   * @prop {Date | undefined} updated_at
   * @prop {Date | undefined} deleted_at
   * @prop {string | undefined} team_id
   * @prop {string | undefined} team_name
   * @prop {string | undefined} enterprise_id
   * @prop {string | undefined} enterprise_name
   * @prop {string} user_id
   * @prop {string | undefined} user_token
   * @prop {string[] | undefined} user_scopes
   * @prop {string | undefined} token_type
   * @prop {boolean} is_enterprise_install
   * @prop {string} app_id
   * @prop {string} auth_version
   * @prop {string[] | undefined} bot_scopes
   * @prop {string | undefined} bot_token
   * @prop {string | undefined} bot_user_id
   * @prop {string | undefined} bot_id
   */

  /**
   * @param {Database} db
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
   * Write the newest installation to the store without concern for what exists.
   *
   * Caution should be used to not duplicate installations with updates instead.
   *
   * @param {oauth.Installation} installation
   */
  async create(installation) {
    const sql = `
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
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16
      )
    `;
    const now = new Date();
    const values = [
      now.toISOString(),
      installation.team?.id,
      installation.team?.name,
      installation.enterprise?.id,
      installation.enterprise?.name,
      installation.user.id,
      installation.user?.token,
      installation.user?.scopes,
      installation.tokenType,
      installation.isEnterpriseInstall,
      installation.appId,
      installation.authVersion,
      installation.bot?.scopes,
      installation.bot?.token,
      installation.bot?.userId,
      installation.bot?.id,
    ];
    await this.db.pool.query(sql, values);
  }

  /**
   * Retreive saved installations that match the queried lookup.
   *
   * Team and enterprise are information is required but the user is optional.
   * Multiple installations or no installations can be returned.
   *
   * @param {oauth.InstallationQuery<boolean>} lookup
   * @returns {Promise<Scan[]>}
   */
  async read(lookup) {
    /**
     * @param {Database} db
     */
    async function search(db) {
      if (!lookup.userId) {
        const sql = `
          SELECT *
          FROM installations
          WHERE
            (enterprise_id IS NULL or enterprise_id = $1) AND
            (team_id IS NULL or team_id = $2) AND
            deleted_at IS NULL
          ORDER BY COALESCE(updated_at, created_at) DESC`;
        const values = [lookup.enterpriseId, lookup.teamId];
        return await db.pool.query(sql, values);
      } else {
        const sql = `
          SELECT *
          FROM installations
          WHERE
            (enterprise_id IS NULL or enterprise_id = $1) AND
            (team_id IS NULL or team_id = $2) AND
            (user_id IS NULL or user_id = $3) AND
            deleted_at IS NULL
          ORDER BY COALESCE(updated_at, created_at) DESC`;
        const values = [lookup.enterpriseId, lookup.teamId, lookup.userId];
        return await db.pool.query(sql, values);
      }
    }
    const scans = await search(this.db);
    return scans.rows.map((ticket) => ({
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
   * Refresh the latest installation to the store with related user information.
   * @param {oauth.Installation} installation
   */
  async update(installation) {
    const query = `
      UPDATE installations
      SET
        updated_at = $1,
        team_name = $2,
        enterprise_name = $3,
        user_token = $4,
        user_scopes = $5,
        token_type = $6,
        is_enterprise_install = $7,
        app_id = $8,
        auth_version = $9,
        bot_scopes = $10,
        bot_token = $11,
        bot_user_id = $12,
        bot_id = $13
      WHERE
        team_id = $14 AND
        enterprise_id = $15 AND
        user_id = $16
    `;
    const now = new Date();
    const values = [
      now.toISOString(),
      installation.team?.name,
      installation.enterprise?.name,
      installation.user?.token,
      installation.user?.scopes,
      installation.tokenType,
      installation.isEnterpriseInstall,
      installation.appId,
      installation.authVersion,
      installation.bot?.scopes,
      installation.bot?.token,
      installation.bot?.userId,
      installation.bot?.id,
      installation.team?.id,
      installation.enterprise?.id,
      installation.user.id,
    ];
    await this.db.pool.query(query, values);
  }
}

/**
 * Installation information for the authorization version.
 * @typedef {"v2"} AuthVersion
 */

/**
 * Convert the stored ticket information into an authentication version.
 * @param {Ticket} ticket
 * @returns {AuthVersion | undefined}
 */
function dbToInstallationAuthVersion(ticket) {
  if (ticket.auth_version !== "v2") {
    return undefined;
  }
  return ticket.auth_version;
}

/**
 * Installation information for the robot.
 * @typedef Bot
 * @prop {string} id
 * @prop {string[]} scopes
 * @prop {string} token
 * @prop {string} userId
 */

/**
 * Convert the stored ticket information into a bot installation object.
 * @param {Ticket} ticket
 * @returns {Bot | undefined}
 * @throws {Error} when expected bot details are missing.
 */
function dbToInstallationBot(ticket) {
  if (!ticket.bot_id) {
    return undefined;
  }
  if (!ticket.bot_scopes || !ticket.bot_token || !ticket.bot_user_id) {
    throw new Error(
      `Missing bot installation details for bot ID ${ticket.bot_id}
      - Bot scopes: ${ticket.bot_scopes}
      - Bot tokens: ${ticket.bot_token}
      - Bot user ID: ${ticket.bot_user_id}`,
    );
  }
  /**
   * @type {Bot}
   */
  const bot = {
    id: ticket.bot_id,
    scopes: ticket.bot_scopes,
    token: ticket.bot_token,
    userId: ticket.bot_user_id,
  };
  return bot;
}

/**
 * Installation information for the enterprise.
 * @typedef Enterprise
 * @prop {string} id
 * @prop {string | undefined} name
 */

/**
 * Convert the stored ticket information into an enterprise installation object.
 * @param {Ticket} ticket
 * @returns {Enterprise | undefined}
 */
function dbToInstallationEnterprise(ticket) {
  if (!ticket.enterprise_id) {
    return undefined;
  }
  /**
   * @type {Enterprise}
   */
  const enterprise = {
    id: ticket.enterprise_id,
    name: ticket.enterprise_name ?? undefined,
  };
  return enterprise;
}

/**
 * Installation information for the team.
 * @typedef Team
 * @prop {string} id
 * @prop {string | undefined} name
 */

/**
 * Convert the stored ticket information into a team installation object.
 * @param {Ticket} ticket
 * @returns {Team | undefined}
 */
function dbToInstallationTeam(ticket) {
  if (!ticket.team_id) {
    return undefined;
  }
  /**
   * @type {Team}
   */
  const team = {
    id: ticket.team_id,
    name: ticket.team_name ?? undefined,
  };
  return team;
}

/**
 * Installation information about the token.
 * @typedef {"bot"} TokenType
 */

/**
 * Convert the stored ticket information into token type details.
 * @param {Ticket} ticket
 * @returns {TokenType | undefined}
 */
function dbToInstallationTokenType(ticket) {
  if (ticket.token_type !== "bot") {
    return undefined;
  }
  return ticket.token_type;
}

/**
 * Installation information for the user.
 * @typedef User
 * @prop {string} id
 * @prop {string[] | undefined} scopes
 * @prop {string | undefined} token
 */

/**
 * Convert the stored ticket information into a user installation object.
 * @param {Ticket} ticket
 * @returns {User}
 */
function dbToInstallationUser(ticket) {
  /**
   * @type {User}
   */
  const user = {
    id: ticket.user_id,
    scopes: ticket.user_scopes ?? undefined,
    token: ticket.user_token ?? undefined,
  };
  return user;
}
