import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAck,
  createClient,
  createDb,
  createLogger,
  loadFixture,
} from "../__stubs__.js";
import deliveryFeedbackViewCallback from "./delivery-feedback.js";

describe("deliveryFeedbackViewCallback", () => {
  it("acks, updates details, and posts ephemeral", async () => {
    const fixture = await loadFixture("view-delivery-feedback-modal.json");
    const ack = createAck();
    const client = createClient();
    const db = createDb();
    const logger = createLogger();

    const generate = async () => ({ text: "", usage: {} });
    const handler = deliveryFeedbackViewCallback({ db, generate });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      view: fixture.view,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const update = db.calls.find((c) => c.method === "updateFeedbackDetails");
    assert.ok(update, "updateFeedbackDetails was called");
    assert.equal(update.args[0], 42);
    assert.deepEqual(update.args[1], {
      details: "The formatting was great",
      resend: false,
      consentToReview: true,
    });

    const post = client.calls.find((c) => c.method === "chat.postEphemeral");
    assert.ok(post, "chat.postEphemeral was called");
    assert.equal(post.args.channel, "C0123456789");
    assert.equal(post.args.user, "U0123456789");
  });

  it("resends when checkbox is selected with details", async () => {
    const fixture = await loadFixture("view-delivery-feedback-modal.json");
    fixture.view.state.values.feedback_options.options.selected_options = [
      { value: "resend" },
    ];

    const ack = createAck();
    const client = createClient({
      fileInfo: {
        ok: true,
        file: {
          plain_text: "Hello, this is a test email.",
          title: "Test Email",
        },
      },
    });
    const generate = async () => ({
      text: "# Regenerated markdown",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    });
    const db = createDb();
    const logger = createLogger();

    const handler = deliveryFeedbackViewCallback({ db, generate });
    await handler({
      ack: ack.fn,
      client,
      body: fixture.body,
      view: fixture.view,
      logger,
    });

    assert.ok(ack.called, "ack was called");

    const update = db.calls.find((c) => c.method === "updateFeedbackDetails");
    assert.ok(update, "updateFeedbackDetails was called");
    assert.deepEqual(update.args[1], {
      details: "The formatting was great",
      resend: true,
      consentToReview: false,
    });

    const upload = client.calls.find((c) => c.method === "filesUploadV2");
    assert.ok(upload, "filesUploadV2 was called");
    assert.equal(upload.args.title, ":recycle: Test Email");

    const deduct = db.calls.find((c) => c.method === "deductStamp");
    assert.equal(deduct, undefined, "no stamp deducted for resend");
  });
});
