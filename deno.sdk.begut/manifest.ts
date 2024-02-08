import { Manifest } from "deno-slack-sdk/mod.ts";
import ExpenseDatastore from "./datastores/expenses.ts";
import SubmitReceiptWorkflow from "./workflows/submit_receipt.ts";

export default Manifest({
  name: "begut",
  description: "a piggy bank that keeps tally",
  icon: "assets/icon.png",
  workflows: [SubmitReceiptWorkflow],
  datastores: [ExpenseDatastore],
  botScopes: [
    "chat:write",
    "chat:write.public",
    "commands",
    "datastore:read",
    "datastore:write",
  ],
  outgoingDomains: [],
});
