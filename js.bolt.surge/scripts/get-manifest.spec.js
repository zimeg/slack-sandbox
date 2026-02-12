import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import getManifest from "./get-manifest.js";

describe("scripts", () => {
  describe("get-manifest", () => {
    beforeEach(() => {
      delete process.env.SLACK_ENVIRONMENT_TAG;
    });

    afterEach(() => {
      delete process.env.SLACK_ENVIRONMENT_TAG;
    });

    it("undefined", () => {
      assert.throws(() => {
        getManifest();
      });
    });

    it("missing", () => {
      process.env.SLACK_ENVIRONMENT_TAG = "unknown";
      assert.throws(() => {
        getManifest();
      });
    });

    it("production", () => {
      process.env.SLACK_ENVIRONMENT_TAG = "production";
      const manifest = getManifest();
      const expected = {
        display_information: {
          name: "surge",
          description: "the simple sorter of streaming mail",
          background_color: "#1a1a10",
          long_description:
            "@surge delivers mail as messages to channels around. some sorting and set settings can be applied to tilt orderings in various directions.\r\n\r\nConfigure an inbox then decide what should go where as new messages arrive!",
        },
        features: {
          app_home: {
            home_tab_enabled: true,
            messages_tab_enabled: true,
            messages_tab_read_only_enabled: true,
          },
          bot_user: {
            display_name: "surge",
            always_online: true,
          },
        },
        oauth_config: {
          redirect_urls: ["https://surgem.ai/slack/oauth_redirect"],
          scopes: {
            bot: ["channels:history", "chat:write"],
          },
        },
        settings: {
          org_deploy_enabled: true,
          event_subscriptions: {
            request_url: "https://surgem.ai/slack/events",
            bot_events: ["app_home_opened", "message.channels"],
          },
          token_rotation_enabled: false,
        },
      };
      assert.deepStrictEqual(manifest, expected);
    });
  });
});
