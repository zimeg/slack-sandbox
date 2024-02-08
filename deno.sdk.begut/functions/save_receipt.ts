import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import ExpenseDatastore, { expenseCategories } from "../datastores/expenses.ts";

export const SaveReceipt = DefineFunction({
  callback_id: "save_receipt_function",
  title: "Save a receipt",
  description: "Store the provided receipt data",
  source_file: "functions/save_receipt.ts",
  input_parameters: {
    properties: {
      spender_id: {
        type: Schema.slack.types.user_id,
        description: "User that submitted the receipt",
      },
      category: {
        type: Schema.types.string,
        description: "Area of life the money was spent",
        enum: Object.keys(expenseCategories),
      },
      cost: {
        type: Schema.types.number,
        description: "Amount of dollars towards this entry",
      },
      expense_date: {
        type: Schema.slack.types.date,
        description: "Roughly when money was being spent",
      },
      notes: {
        type: Schema.types.string,
        description: "Additional notes to include",
      },
    },
    required: ["spender_id", "category", "cost", "expense_date"],
  },
  output_parameters: {
    properties: {
      expense_id: {
        type: Schema.types.string,
        description: "An unique identifier of the expense",
      },
      receipt_id: {
        type: Schema.types.string,
        description: "An unique identifier for this receipt",
      },
      spender_id: {
        type: Schema.slack.types.user_id,
        description: "User that submitted the receipt",
      },
      created_ts: {
        type: Schema.slack.types.timestamp,
        description: "The moment this expense was created",
      },
      expense_date: {
        type: Schema.slack.types.date,
        description: "Roughly when money was being spent",
      },
      category: {
        type: Schema.types.string,
        description: "Area of life the money was spent",
        enum: Object.values(expenseCategories),
      },
      cost: {
        type: Schema.types.number,
        description: "Amount of dollars towards this entry",
      },
    },
    required: [
      "expense_id",
      "receipt_id",
      "spender_id",
      "created_ts",
      "expense_date",
      "category",
      "cost",
    ],
  },
});

export default SlackFunction(SaveReceipt, async ({ inputs, client }) => {
  const expense_id = crypto.randomUUID();
  const receipt_id = crypto.randomUUID();
  const created_ts = Math.floor(Date.now() / 1000);
  const { spender_id, category, cost, expense_date, notes } = inputs;
  const categoryPlain = expenseCategories[category];

  const resp = await client.apps.datastore.put<
    typeof ExpenseDatastore.definition
  >({
    datastore: "expenses",
    item: {
      expense_id,
      spender_id,
      created_ts,
      category: categoryPlain,
      cost,
      expense_date,
      notes,
    },
  });

  if (!resp.ok) {
    return { error: `Failed to save receipt: ${resp.error}` };
  }
  return {
    outputs: {
      expense_id,
      receipt_id,
      spender_id,
      created_ts,
      category: categoryPlain,
      cost,
      expense_date,
    },
  };
});
