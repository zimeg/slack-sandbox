import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAck,
  createClient,
  createDb,
  createLogger,
  loadFixture,
} from "../__stubs__.js";
import {
  deliveryFeedbackCallback,
  deliveryFeedbackDetailsCallback,
} from "./delivery-feedback.js";

describe("deliveryFeedbackCallback", () => {
  it("acks, saves feedback, and posts ephemeral", async () => {
    const fixture = await loadFixture("action-delivery-feedback.json");
    const ack = createAck();
    const client = createClient();
    const db = createDb({ feedbackId: 7 });
    const logger = createLogger();

    const handler = deliveryFeedbackCallback({ db });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      action: fixture.action,
      context: fixture.context,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const save = db.calls.find((c) => c.method === "saveFeedback");
    assert.ok(save, "saveFeedback was called");
    assert.equal(save.args[0].rating, "+1");
    assert.equal(save.args[0].fileId, "F0123456789");
    assert.equal(save.args[0].userId, "U0123456789");
    assert.equal(save.args[0].teamId, "T0123456789");

    const post = client.calls.find((c) => c.method === "chat.postEphemeral");
    assert.ok(post, "chat.postEphemeral was called");
    assert.equal(post.args.channel, "C0123456789");
    assert.equal(post.args.user, "U0123456789");

    const button = post.args.blocks[0].accessory;
    assert.equal(button.text.text, "More thoughts");
    const value = JSON.parse(button.value);
    assert.equal(value.fileId, "F0123456789");
    assert.equal(value.teamId, "T0123456789");
  });
});

describe("deliveryFeedbackDetailsCallback", () => {
  it("acks and opens modal with correct trigger_id", async () => {
    const fixture = await loadFixture("action-delivery-feedback-details.json");
    const ack = createAck();
    const client = createClient();
    const logger = createLogger();

    const handler = deliveryFeedbackDetailsCallback();
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      action: fixture.action,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const open = client.calls.find((c) => c.method === "views.open");
    assert.ok(open, "views.open was called");
    assert.equal(open.args.trigger_id, "333.444.def");
    assert.equal(open.args.view.callback_id, "delivery_feedback_modal");

    const metadata = JSON.parse(open.args.view.private_metadata);
    assert.equal(metadata.fileId, "F0123456789");
    assert.equal(metadata.teamId, "T0123456789");

    assert.equal(
      open.args.view.blocks.length,
      2,
      "positive modal has two blocks",
    );
  });

  it("includes checkboxes for negative feedback", async () => {
    const fixture = await loadFixture("action-delivery-feedback-details.json");
    fixture.action.value = fixture.action.value.replace("+1", "-1");
    const ack = createAck();
    const client = createClient();
    const logger = createLogger();

    const handler = deliveryFeedbackDetailsCallback();
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      action: fixture.action,
      logger,
    });

    const open = client.calls.find((c) => c.method === "views.open");
    assert.equal(
      open.args.view.blocks.length,
      3,
      "negative modal has three blocks",
    );
    assert.equal(open.args.view.blocks[2].element.type, "checkboxes");
    assert.ok(
      open.args.view.blocks[2].element.initial_options,
      "resend is pre-checked",
    );
  });
});
