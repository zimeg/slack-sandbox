import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "assert/mod.ts";
import { MockFetch } from "deno-mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import SaveReceipt from "./save_receipt.ts";

const { createContext } = SlackFunctionTester("save_receipt_function");
const mockFetch = new MockFetch();

Deno.test("Saves receipt and returns data", async () => {
  const inputs = {
    spender_id: "U123",
    category: "🥬 groceries",
    cost: 12.06,
    expense_date: "2022-02-22",
    notes: "yum",
  };
  mockFetch
    .intercept("https://slack.com/api/apps.datastore.put", { method: "POST" })
    .response(
      `{"ok":true,"datastore":"expenses","item":${JSON.stringify(inputs)}}`,
      { status: 200 },
    );
  const { outputs } = await SaveReceipt(createContext({ inputs }));

  assertExists(outputs);
  assertExists(outputs.expense_id);
  assertExists(outputs.receipt_id);
  assertEquals(outputs.spender_id, "U123");
  assertExists(outputs.created_ts);
  assertEquals(outputs.expense_date, "2022-02-22");
  assertEquals(outputs.category, "groceries");
  assertEquals(outputs.cost, 12.06);
});

Deno.test("Gracefully errors on datastore errors", async () => {
  mockFetch
    .intercept("https://slack.com/api/apps.datastore.put", { method: "POST" })
    .response(
      `{"ok":false,"error":"datastore_error"}`,
      { status: 200 },
    );
  const inputs = {
    spender_id: "U123",
    category: "🥬 groceries",
    cost: 12.06,
    expense_date: "2022-02-22",
    notes: "yum",
  };
  const { outputs, error } = await SaveReceipt(createContext({ inputs }));

  assertExists(error);
  assertStringIncludes(error, "datastore_error");
  assertEquals(outputs, undefined);
});
