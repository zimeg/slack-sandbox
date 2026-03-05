/**
 * @file Stub factories for testing listener handlers.
 */

import { readFile } from "node:fs/promises";

/**
 * Load a JSON fixture from the shared fixtures directory.
 * @param {string} name - Fixture filename
 * @returns {Promise<any>}
 */
export async function loadFixture(name) {
  const path = new URL(`./__fixtures__/${name}`, import.meta.url);
  return JSON.parse(await readFile(path, "utf-8"));
}

/**
 * @typedef {Object} StubCall
 * @property {string} method
 * @property {any} args
 */

/**
 * Create a stub ack function that tracks whether it was called.
 * @returns {{ fn: () => Promise<void>, called: boolean }}
 */
export function createAck() {
  const stub = {
    called: false,
    /** @type {() => Promise<void>} */
    fn: async () => {
      stub.called = true;
    },
  };
  return stub;
}

/**
 * @typedef {Object} StubClientReturns
 * @property {{ ok: boolean, file?: any }} [fileInfo] - Value returned from files.info
 */

/**
 * Create a stub Slack WebClient with call tracking.
 * @param {StubClientReturns} [returns]
 * @returns {{
 *   calls: StubCall[],
 *   chat: {
 *     postEphemeral: (args: any) => Promise<{ ok: boolean }>,
 *     postMessage: (args: any) => Promise<{ ok: boolean }>
 *   },
 *   files: { info: (args: any) => Promise<{ ok: boolean, file?: any }> },
 *   filesUploadV2: (args: any) => Promise<{ ok: boolean }>,
 *   views: {
 *     open: (args: any) => Promise<{ ok: boolean }>,
 *     publish: (args: any) => Promise<{ ok: boolean }>
 *   }
 * }}
 */
export function createClient(returns = {}) {
  const { fileInfo = { ok: true, file: {} } } = returns;
  /** @type {StubCall[]} */
  const calls = [];
  return {
    calls,
    chat: {
      /** @param {any} args */
      postEphemeral: async (args) => {
        calls.push({ method: "chat.postEphemeral", args });
        return { ok: true };
      },
      /** @param {any} args */
      postMessage: async (args) => {
        calls.push({ method: "chat.postMessage", args });
        return { ok: true };
      },
    },
    files: {
      /** @param {any} args */
      info: async (args) => {
        calls.push({ method: "files.info", args });
        return fileInfo;
      },
    },
    /** @param {any} args */
    filesUploadV2: async (args) => {
      calls.push({ method: "filesUploadV2", args });
      return { ok: true };
    },
    views: {
      /** @param {any} args */
      open: async (args) => {
        calls.push({ method: "views.open", args });
        return { ok: true };
      },
      /** @param {any} args */
      publish: async (args) => {
        calls.push({ method: "views.publish", args });
        return { ok: true };
      },
    },
  };
}

/**
 * @typedef {Object} StubDbReturns
 * @property {number} [feedbackId] - Value returned from saveFeedback
 * @property {number} [balance] - Value returned from getBalance and grantBonusStamp
 * @property {number} [usageCount] - Value returned from getUsageCount
 */

/**
 * Create a stub database with call tracking and configurable return values.
 * @param {StubDbReturns} [returns]
 * @returns {{ calls: StubCall[] } & import("../../lib/database/index.js").Database}
 */
export function createDb(returns = {}) {
  const { feedbackId = 42, balance = 10, usageCount = 5 } = returns;
  /** @type {StubCall[]} */
  const calls = [];
  return {
    calls,
    load: async () => calls.push({ method: "load", args: [] }),
    /** @param {...any} args */
    query: async (...args) => calls.push({ method: "query", args }),
    getMessageCount: async () => {
      calls.push({ method: "getMessageCount", args: [] });
      return 0;
    },
    getMessageCountBySource: async () => {
      calls.push({ method: "getMessageCountBySource", args: [] });
      return { total: 0, web: 0, slack: 0 };
    },
    /** @param {string} source */
    incrementMessageCount: async (source) => {
      calls.push({ method: "incrementMessageCount", args: [source] });
      return 0;
    },
    /** @param {{ teamId?: string, enterpriseId?: string }} params */
    getBalance: async (params) => {
      calls.push({ method: "getBalance", args: [params] });
      return balance;
    },
    /** @param {{ teamId?: string, enterpriseId?: string }} params */
    getUsageCount: async (params) => {
      calls.push({ method: "getUsageCount", args: [params] });
      return usageCount;
    },
    /** @param {{ teamId?: string, enterpriseId?: string, amount?: number }} params */
    grantStarterStamps: async (params) => {
      calls.push({ method: "grantStarterStamps", args: [params] });
    },
    /** @param {{ teamId?: string, enterpriseId?: string }} params */
    grantBonusStamp: async (params) => {
      calls.push({ method: "grantBonusStamp", args: [params] });
      return balance;
    },
    /** @param {{ teamId?: string, enterpriseId?: string, userId?: string, model: string, inputTokens: number, outputTokens: number, totalTokens: number, referenceId: string }} params */
    deductStamp: async (params) => {
      calls.push({ method: "deductStamp", args: [params] });
      return true;
    },
    /** @param {{ teamId?: string, enterpriseId?: string, userId: string, fileId: string, rating: string, details?: string }} params */
    saveFeedback: async (params) => {
      calls.push({ method: "saveFeedback", args: [params] });
      return feedbackId;
    },
    /**
     * @param {number} id
     * @param {{ details: string | null, resend: boolean, consentToReview: boolean }} fields
     */
    updateFeedbackDetails: async (id, fields) => {
      calls.push({ method: "updateFeedbackDetails", args: [id, fields] });
    },
  };
}

/**
 * Create a silent logger stub that discards all output.
 * @returns {{ debug: (...args: any[]) => void, info: (...args: any[]) => void, warn: (...args: any[]) => void, error: (...args: any[]) => void }}
 */
export function createLogger() {
  /** @type {(...args: any[]) => void} */
  const noop = () => {};
  return { debug: noop, info: noop, warn: noop, error: noop };
}
