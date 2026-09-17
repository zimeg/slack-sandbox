import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createClient,
  createDb,
  createLogger,
  loadFixture,
} from "../__stubs__.js";
import appHomeOpenedCallback from "./app-home-opened.js";

describe("appHomeOpenedCallback", () => {
  it("publishes home view with balance and usage", async () => {
    const fixture = await loadFixture("event-app-home-opened.json");
    const client = createClient();
    const db = createDb({ balance: 10, usageCount: 3 });
    const logger = createLogger();

    const handler = appHomeOpenedCallback({ db });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    const publish = client.calls.find((c) => c.method === "views.publish");
    assert.ok(publish, "views.publish was called");
    assert.equal(publish.args.user_id, "U0123456789");
    assert.equal(publish.args.view.type, "home");

    const blocks = publish.args.view.blocks;
    assert.equal(blocks[0].type, "header");
    assert.match(blocks[1].text.text, /U0101010101/);
    assert.match(blocks[5].text.text, /\*Messages delivered:\* 3/);
    assert.match(blocks[5].text.text, /\*Stamps remaining:\* 10/);
    assert.equal(blocks[6].elements[0].action_id, "order_stamps");
  });

  it("queries balance and usage for the team", async () => {
    const fixture = await loadFixture("event-app-home-opened.json");
    const client = createClient();
    const db = createDb({ balance: 50, usageCount: 12 });
    const logger = createLogger();

    const handler = appHomeOpenedCallback({ db });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    const balanceCall = db.calls.find((c) => c.method === "getBalance");
    assert.ok(balanceCall, "getBalance was called");
    assert.equal(balanceCall.args[0].teamId, "T0123456789");

    const usageCall = db.calls.find((c) => c.method === "getUsageCount");
    assert.ok(usageCall, "getUsageCount was called");
    assert.equal(usageCall.args[0].teamId, "T0123456789");
  });

  it("skips when tab is not home", async () => {
    const fixture = await loadFixture("event-app-home-opened.json");
    const client = createClient();
    const db = createDb();
    const logger = createLogger();

    const handler = appHomeOpenedCallback({ db });
    await handler({
      client,
      event: { ...fixture.event, tab: "messages" },
      context: fixture.context,
      logger,
    });

    assert.equal(client.calls.length, 0, "no client calls");
    assert.equal(db.calls.length, 0, "no db calls");
  });
});
