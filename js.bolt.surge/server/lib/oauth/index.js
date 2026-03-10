import { neon } from "@neondatabase/serverless";
import Store from "./store.js";

/**
 * Get a SQL query function connected to the database.
 * @returns {ReturnType<typeof neon>}
 */
function getSQL() {
  return neon(process.env.POSTGRES_URL);
}

/**
 * Create an OAuth install provider with database-backed installation store.
 * @param {import("../database/index.js").Database} db
 * @returns {{ installationStore: import("@slack/oauth").InstallationStore }}
 */
export function createInstallProvider(db) {
  const store = new Store(db);

  /** @type {import("@slack/oauth").InstallationStore} */
  const installationStore = {
    storeInstallation: async (installation) => {
      const existing = await store.read({
        teamId: installation.team?.id,
        enterpriseId: installation.enterprise?.id,
        isEnterpriseInstall: installation.isEnterpriseInstall ?? false,
      });
      if (existing.length > 0) {
        await store.update(installation);
      } else {
        await store.create(installation);
      }
    },
    fetchInstallation: async (installQuery) => {
      const results = await store.read(installQuery);
      if (results.length === 0) {
        throw new Error(
          `No installation found for team ${installQuery.teamId}`,
        );
      }
      return results[0].installation;
    },
    deleteInstallation: async (installQuery) => {
      const sql = getSQL();
      const now = new Date().toISOString();
      await sql`
        UPDATE installations
        SET deleted_at = ${now}
        WHERE
          (team_id IS NULL OR team_id = ${installQuery.teamId ?? null}) AND
          (enterprise_id IS NULL OR enterprise_id = ${installQuery.enterpriseId ?? null})
      `;
    },
  };

  return { installationStore };
}
