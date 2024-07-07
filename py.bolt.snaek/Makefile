.PHONY: format
format:
	ruff format

.PHONY: lint
lint:
	ruff check

.PHONY: test
test: format lint
	python3 -m mypy **/*.py
