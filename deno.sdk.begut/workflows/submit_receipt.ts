import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SaveReceipt } from "../functions/save_receipt.ts";
import { expenseCategories } from "../datastores/expenses.ts";

const SubmitReceiptWorkflow = DefineWorkflow({
  callback_id: "submit_receipt",
  title: "Submit receipt",
  description: "Save information about a past payment",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      spender_id: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["interactivity", "channel_id", "spender_id"],
  },
});

const receiptInfo = SubmitReceiptWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Submit a new receipt",
    interactivity: SubmitReceiptWorkflow.inputs.interactivity,
    submit_label: "Save",
    fields: {
      elements: [{
        name: "category",
        title: "Category of spend",
        type: Schema.types.string,
        enum: Object.keys(expenseCategories),
      }, {
        name: "cost",
        title: "Total cost",
        type: Schema.types.number,
      }, {
        name: "expense_date",
        title: "Date of payment",
        type: Schema.slack.types.date,
      }, {
        name: "notes",
        title: "Additional notes",
        type: Schema.types.string,
        long: true,
      }],
      required: ["category", "cost", "expense_date"],
    },
  },
);

const receipt = SubmitReceiptWorkflow.addStep(SaveReceipt, {
  spender_id: SubmitReceiptWorkflow.inputs.spender_id,
  category: receiptInfo.outputs.fields.category,
  cost: receiptInfo.outputs.fields.cost,
  expense_date: receiptInfo.outputs.fields.expense_date,
  notes: receiptInfo.outputs.fields.notes,
});

SubmitReceiptWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SubmitReceiptWorkflow.inputs.channel_id,
  metadata: {
    event_type: "receipt_added",
    event_payload: {
      receipt_id: receipt.outputs.receipt_id,
      expense_id: receipt.outputs.expense_id,
      created_ts: receipt.outputs.created_ts,
      cost: receiptInfo.outputs.fields.cost,
      category: receipt.outputs.category,
      expense_date: receiptInfo.outputs.fields.expense_date,
      notes: receiptInfo.outputs.fields.notes,
    },
  },
  message: `*a new receipt has been saved:*

${receiptInfo.outputs.fields.category} cost \`$${receiptInfo.outputs.fields.cost}\` on ${receiptInfo.outputs.fields.expense_date}
> ${receiptInfo.outputs.fields.notes}`,
});

export default SubmitReceiptWorkflow;
