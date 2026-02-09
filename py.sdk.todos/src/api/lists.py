"""Slack Lists API wrapper for todos management."""

from typing import Any

from slack_sdk import WebClient

import config


class SlackLists:
    """Wrapper for Slack Lists API."""

    def __init__(self):
        self.client = WebClient(
            token=config.token.get(),
        )
        self.list_id = config.list.get()
        self._columns: dict[str, str] | None = None

    def _get_columns(self) -> dict[str, str]:
        """Get column key to ID mapping from existing items."""
        if self._columns is not None:
            return self._columns

        items = self.list_items()
        columns = {}
        for item in items:
            for field in item.get("fields", []):
                key = field.get("key", "")
                col_id = field.get("column_id", "")
                if key and col_id and key not in columns:
                    columns[key] = col_id
        self._columns = columns
        return columns

    @staticmethod
    def create_list(
        name: str = "Todo's Guide",
    ) -> dict[str, Any]:
        """Create a new list with the todos schema."""
        client = WebClient(
            token=config.token.get(),
        )
        response = client.slackLists_create(
            name=name,
            todo_mode=True,
        )
        return response.data

    def list_items(self) -> list[dict[str, Any]]:
        """Fetch all items from a list."""
        response = self.client.slackLists_items_list(
            list_id=self.list_id,
        )
        return response.data.get("items", [])

    def create_item(
        self,
        title: str,
        due_date: str | None = None,
    ) -> dict[str, Any]:
        """Create a new todo item."""
        columns = self._get_columns()
        initial_fields: list[dict[str, Any]] = [
            {
                "column_id": columns["name"],
                "rich_text": [
                    {
                        "type": "rich_text",
                        "elements": [
                            {
                                "type": "rich_text_section",
                                "elements": [
                                    {
                                        "type": "text",
                                        "text": title,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
        if due_date:
            initial_fields.append(
                {
                    "column_id": columns["todo_due_date"],
                    "date": [due_date],
                }
            )
        response = self.client.slackLists_items_create(
            list_id=self.list_id,
            initial_fields=initial_fields,
        )
        return response.data

    def update_item(
        self,
        cells: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Update an existing todo item.

        cells is a list of dicts with column_id, row_id, and typed value, e.g.:
            {"row_id": "Rec0123456789", "column_id": "Col0123456789", "checkbox": True}
        """
        response = self.client.slackLists_items_update(
            list_id=self.list_id,
            cells=cells,
        )
        return response.data
