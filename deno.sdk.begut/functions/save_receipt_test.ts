import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "assert/mod.ts";
import * as mf from "mock-fetch/mod.ts";
import SaveReceipt from "./save_receipt.ts";

const { createContext } = SlackFunctionTester("save_receipt_function");

mf.install();

mf.mock("POST@/api/apps.datastore.put", async (args) => {
  const body = await args.formData();
  const datastore = body.get("datastore");
  const item = body.get("item");
  return new Response(
    `{"ok": true, "datastore": "${datastore}", "item": ${item}}`,
    {
      status: 200,
    },
  );
});

Deno.test("Saves receipt and returns data", async () => {
  const inputs = {
    spender_id: "U123",
    category: "🥬 groceries",
    cost: 12.06,
    expense_date: "2022-02-22",
    notes: "yum",
  };
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
  mf.mock("POST@/api/apps.datastore.put", () => {
    return new Response(`{"ok": false, "error": "datastore_error"}`, {
      status: 200,
    });
  });

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
