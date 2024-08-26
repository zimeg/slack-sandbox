import oauth from "@slack/oauth";
import Dotenv from "../config/dotenv.js";
import tags from "../config/tags.js";
import Database from "../database/index.js";
import Store from "./store.js";

export default class OAuth {
  /**
   * @type {oauth.InstallationStore}
   */
  installationStore;

  /**
   * @constructor
   * @param {Dotenv} env
   * @param {Database} db
   */
  constructor(env, db) {
    const store = new Store(db);
    switch (env.vars.tag) {
      case tags.PRODUCTION:
        this.installationStore = {
          storeInstallation: this.getStoreInstallation(store),
          fetchInstallation: this.getFetchInstallation(store),
        };
        return;
      case tags.DEVELOPMENT:
        this.installationStore = new oauth.FileInstallationStore({
          baseDir: env.vars.fileInstallationStore,
        });
        return;
    }
    throw new Error(`Installation store not found for tag: ${env.vars.tag}`);
  }

  /**
   * @param {Store} store
   * @returns {function(oauth.Installation): Promise<void>}
   */
  getStoreInstallation(store) {
    /**
     * @param {oauth.Installation} installation
     * @returns {Promise<void>}
     */
    return async function (installation) {
      const installations = await store.read({
        enterpriseId: installation.enterprise?.id,
        isEnterpriseInstall: installation.isEnterpriseInstall ?? false,
        teamId: installation.team?.id,
        userId: installation.user.id,
      });
      const user = installations.filter(
        (scan) => scan.installation.user.id === installation.user.id,
      );
      if (user.length > 1) {
        throw new Error("Multiple installations were found!");
      } else if (user.length <= 0) {
        console.info("Saving new installation information");
        return await store.create(installation);
      } else {
        console.info("Updating existing installation information");
        return await store.update(installation);
      }
    };
  }

  /**
   * @param {Store} store
   * @returns {function(oauth.InstallationQuery<boolean>): Promise<oauth.Installation>}
   */
  getFetchInstallation(store) {
    /**
     * @param {oauth.InstallationQuery<boolean>} lookup
     * @returns {Promise<oauth.Installation>}
     */
    return async function (lookup) {
      if (!lookup.userId) {
        throw new Error("Cannot fetch installation for a missing user ID");
      }
      const installations = await store.read({
        enterpriseId: lookup.enterpriseId,
        isEnterpriseInstall: lookup.isEnterpriseInstall,
        teamId: lookup.teamId,
      });
      if (installations.length <= 0) {
        throw new Error("No installation was found!");
      }
      const users = installations.filter(
        (scan) => scan.installation.user.id === lookup.userId,
      );
      if (users.length > 1) {
        throw new Error("Multiple matching user installations found!");
      }
      if (users.length > 0) {
        return users[0].installation;
      }
      console.warn(
        "Missing user installation so sharing most recent team installation",
      );
      const [scan] = installations;
      scan.installation.user = {
        id: lookup.userId,
        token: undefined,
        scopes: undefined,
      };
      return scan.installation;
    };
  }
}
