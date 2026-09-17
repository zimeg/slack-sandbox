import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAck,
  createClient,
  createDb,
  createLogger,
  loadFixture,
} from "../__stubs__.js";
import orderStampsCallback from "./order-stamps.js";

describe("orderStampsCallback", () => {
  it("acks, grants stamp, and publishes home view", async () => {
    const fixture = await loadFixture("action-order-stamps.json");
    const ack = createAck();
    const client = createClient();
    const db = createDb({ balance: 11, usageCount: 5 });
    const logger = createLogger();

    const handler = orderStampsCallback({ db });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      context: fixture.context,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const grant = db.calls.find((c) => c.method === "grantBonusStamp");
    assert.ok(grant, "grantBonusStamp was called");
    assert.equal(grant.args[0].teamId, "T0123456789");

    const publish = client.calls.find((c) => c.method === "views.publish");
    assert.ok(publish, "views.publish was called");
    assert.equal(publish.args.user_id, "U0123456789");
    assert.equal(publish.args.view.type, "home");
  });

  it("returns without action when botUserId is missing", async () => {
    const fixture = await loadFixture("action-order-stamps.json");
    const ack = createAck();
    const client = createClient();
    const db = createDb();
    const logger = createLogger();

    const handler = orderStampsCallback({ db });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      context: { ...fixture.context, botUserId: undefined },
      logger,
    });

    assert.ok(ack.called, "ack was called");
    assert.equal(db.calls.length, 0, "no db calls");
    assert.equal(client.calls.length, 0, "no client calls");
  });

  it("logs errors without throwing", async () => {
    const fixture = await loadFixture("action-order-stamps.json");
    const ack = createAck();
    const client = createClient();
    const errors = [];
    const logger = {
      ...createLogger(),
      error: (...args) => errors.push(args),
    };
    const db = createDb();
    db.grantBonusStamp = async () => {
      throw new Error("db failure");
    };

    const handler = orderStampsCallback({ db });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      context: fixture.context,
      logger,
    });

    assert.ok(ack.called, "ack was called");
    assert.equal(errors.length, 1, "error was logged");
  });
});
