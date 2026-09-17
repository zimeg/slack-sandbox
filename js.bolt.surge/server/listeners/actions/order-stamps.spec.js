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
  it("acks and confirms that ordering is coming soon", async () => {
    const fixture = await loadFixture("action-order-stamps.json");
    const ack = createAck();
    const client = createClient();
    const logger = createLogger();

    const handler = orderStampsCallback();
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      context: fixture.context,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const message = client.calls.find((c) => c.method === "chat.postEphemeral");
    assert.ok(message, "an ephemeral message was sent");
    assert.match(message.args.text, /coming soon/);
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
    client.chat.postEphemeral = async () => {
      throw new Error("Slack failure");
    };

    const handler = orderStampsCallback();
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
