# Maintainers guide

Notes for when the human touch is still needed.

## Testing tasks

Confidence in the code can be confirmed with a few checks. These mostly ensure
types make sense while sensible logic is left to experimentation.

Run the entire test suite or perform individual measurements:

```sh
$ make test    # Entire test suites

$ mypy app.py  # Static type checks
```
