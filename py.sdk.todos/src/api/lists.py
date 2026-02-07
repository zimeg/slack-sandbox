"""Slack Lists API wrapper for todos management."""

from typing import Any

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError



class SlackLists:
    """Wrapper for Slack Lists API."""

    def __init__(self, token: str):
        self.client = WebClient(token=token)

    def create_list(self, name: str = "Todo's Guide") -> dict[str, Any]:
        """Create a new list with the todos schema."""
        try:
            response = self.client.api_call(
                "slackLists.create",
                json={
                    "name": name,
                    "todo_mode": True,
                },
            )
            return response.data
        except SlackApiError as e:
            raise RuntimeError(f"Failed to create list: {e.response['error']}")

    def list_items(self, list_id: str) -> list[dict[str, Any]]:
        """Fetch all items from a list."""
        try:
            response = self.client.api_call(
                "slackLists.items.list",
                json={"list_id": list_id},
            )
            return response.data.get("items", [])
        except SlackApiError as e:
            raise RuntimeError(f"Failed to list items: {e.response['error']}")

    def create_item(
        self,
        list_id: str,
        title: str,
        due_date: str | None = None,
    ) -> dict[str, Any]:
        """Create a new todo item."""
        payload: dict[str, Any] = {
            "list_id": list_id,
            "name": title,
        }

        if due_date:
            payload["due_date"] = due_date

        try:
            response = self.client.api_call(
                "slackLists.items.create",
                json=payload,
            )
            return response.data
        except SlackApiError as e:
            raise RuntimeError(f"Failed to create item: {e.response['error']}")

    def update_item(
        self,
        list_id: str,
        item_id: str,
        cells: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Update an existing todo item.

        cells is a list of dicts with column_id, row_id, and typed value, e.g.:
            {"column_id": "Col00", "row_id": item_id, "checkbox": True}
        """
        for cell in cells:
            cell.setdefault("row_id", item_id)

        try:
            response = self.client.api_call(
                "slackLists.items.update",
                json={
                    "list_id": list_id,
                    "cells": cells,
                },
            )
            return response.data
        except SlackApiError as e:
            raise RuntimeError(f"Failed to update item: {e.response['error']}")

    def get_item(self, list_id: str, item_id: str) -> dict[str, Any] | None:
        """Get a single item by ID."""
        items = self.list_items(list_id)
        for item in items:
            if item.get("id") == item_id:
                return item
        return None
