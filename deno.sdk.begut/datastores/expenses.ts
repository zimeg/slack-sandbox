import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/*
 * expenseCategories contains a mapping of category labels to stable values
 */
export const expenseCategories: {
  [key: string]: string;
} = {
  "🎨 arts": "art",
  "📦 belongings": "belongings",
  "🧣 clothing": "clothing",
  "💾 computers": "computers",
  "🕹️ gaming": "gaming",
  "👠 glamour": "glamour",
  "🥬 groceries": "groceries",
  "🏥 health": "health",
  "🧺 housings": "housing",
  "🎹 music": "music",
  "🐈 pets": "pets",
  "🪴 plants": "plants",
  "🏠 rent": "rent",
  "🍽️ restaurant": "restaurant",
  "🚲 transportation": "transportation",
  "✈️ travel": "travel",
  "🍫 treats": "treats",
  "🔌 utilities": "utilities",
};

const ExpensesDatastore = DefineDatastore({
  name: "expenses",
  primary_key: "expense_id",
  attributes: {
    expense_id: {
      type: Schema.types.string,
      description: "An identifier of this entry",
    },
    created_ts: {
      type: Schema.slack.types.timestamp,
      description: "The moment this expense was created",
    },
    spender_id: {
      type: Schema.slack.types.user_id,
      description: "Person that submitted the receipt",
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
      required: true,
    },
    notes: {
      type: Schema.types.string,
      description: "Additional notes to include",
    },
  },
});

export default ExpensesDatastore;
