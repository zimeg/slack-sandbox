ifndef VERBOSE
.SILENT:
else
VERBOSE_FLAG = "--verbose"
endif
SLACK_APP_ID ?= "A0582JYKGB1"
SLACK_MANIFEST_FILE = "manifest.json"
SLACK_SCHEMA_FILE ?= ".slack/schema.json"
SLACK_SCHEMA_URL ?= "https://json.schemastore.org/slack-app-manifest.json"

.PHONY: all
all:
	printf "\x1b[1mInclude a command!\x1b[0;2m $ make test\x1b[0m\n"
	printf "   clean  remove cached project files\n"
	printf "  format  format code styles\n"
	printf "    lint  check the lintings\n"
	printf "  schema  compare manifest to schema\n"
	printf "    test  above with static type check\n"

.PHONY: clean
clean:
	rm -rf .mypy_cache
	rm -rf .ruff_cache
	rm -rf __pycache__

.PHONY: lint
lint:
	ruff format
	ruff check

.PHONY: schema
schema:
	find $(SLACK_SCHEMA_FILE) 1> /dev/null || curl -o $(SLACK_SCHEMA_FILE) $(SLACK_SCHEMA_URL)
	# yajsv -s $(SLACK_SCHEMA_FILE) manifest.json
	# slack manifest validate --app $(SLACK_APP_ID) $(VERBOSE_FLAG) || (printf "\x1b[2mSuggestion: Change the \x1b[1mSLACK_APP_ID='%s'\x1b[0;2m variable!\x1b[0m\n" $(SLACK_APP_ID) && exit 1)

.PHONY: test
test: schema
	ruff format --diff
	ruff check --diff
	python3 -m mypy **/*.py
