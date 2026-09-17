import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createClient,
  createDb,
  createLogger,
  loadFixture,
} from "../__stubs__.js";
import fileSharedCallback from "./file-shared.js";

describe("fileSharedCallback", () => {
  it("converts email and uploads markdown", async () => {
    const fixture = await loadFixture("event-file-shared-substack.json");
    const client = createClient({
      fileInfo: { ok: true, file: fixture.file },
    });
    const db = createDb({ balance: 5 });
    const logger = createLogger();
    const generate = async () => ({
      text: "# Converted email",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    });

    const handler = fileSharedCallback({ db, generate });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    const deduct = db.calls.find((c) => c.method === "deductStamp");
    assert.ok(deduct, "deductStamp was called");
    assert.equal(deduct.args[0].teamId, "T02A074M3U3");
    assert.equal(deduct.args[0].referenceId, "F0AJ6L3DVUZ");

    const upload = client.calls.find((c) => c.method === "filesUploadV2");
    assert.ok(upload, "filesUploadV2 was called");
    assert.match(upload.args.title, /Joy/);
    assert.equal(upload.args.thread_ts, "1772349715.000100");

    const count = db.calls.find((c) => c.method === "incrementMessageCount");
    assert.ok(count, "incrementMessageCount was called");
  });

  it("skips non-email files", async () => {
    const fixture = await loadFixture("event-file-shared-substack.json");
    const file = { ...fixture.file, filetype: "png" };
    const client = createClient({ fileInfo: { ok: true, file } });
    const db = createDb();
    const logger = createLogger();
    const generate = async () => ({ text: "", usage: {} });

    const handler = fileSharedCallback({ db, generate });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    const deduct = db.calls.find((c) => c.method === "deductStamp");
    assert.equal(deduct, undefined, "no stamp deducted");
    const upload = client.calls.find((c) => c.method === "filesUploadV2");
    assert.equal(upload, undefined, "no upload attempted");
  });

  it("posts a message when no stamps remain", async () => {
    const fixture = await loadFixture("event-file-shared-substack.json");
    const client = createClient({
      fileInfo: { ok: true, file: fixture.file },
    });
    const db = createDb({ balance: 0 });
    const logger = createLogger();
    const generate = async () => ({ text: "", usage: {} });

    const handler = fileSharedCallback({ db, generate });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    const msg = client.calls.find((c) => c.method === "chat.postMessage");
    assert.ok(msg, "chat.postMessage was called");
    assert.match(msg.args.text, /No stamps remaining/);

    const upload = client.calls.find((c) => c.method === "filesUploadV2");
    assert.equal(upload, undefined, "no upload attempted");
  });

  it("returns when files.info fails", async () => {
    const fixture = await loadFixture("event-file-shared-substack.json");
    const client = createClient({ fileInfo: { ok: false } });
    const db = createDb();
    const logger = createLogger();
    const generate = async () => ({ text: "", usage: {} });

    const handler = fileSharedCallback({ db, generate });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    assert.equal(db.calls.length, 0, "no db calls");
    const upload = client.calls.find((c) => c.method === "filesUploadV2");
    assert.equal(upload, undefined, "no upload attempted");
  });

  it("returns when email has no content", async () => {
    const fixture = await loadFixture("event-file-shared-substack.json");
    const file = {
      ...fixture.file,
      plain_text: undefined,
      preview_plain_text: undefined,
      preview: undefined,
    };
    const client = createClient({ fileInfo: { ok: true, file } });
    const db = createDb();
    const logger = createLogger();
    const generate = async () => ({ text: "", usage: {} });

    const handler = fileSharedCallback({ db, generate });
    await handler({
      client,
      event: fixture.event,
      context: fixture.context,
      logger,
    });

    assert.equal(db.calls.length, 0, "no db calls");
  });
});
