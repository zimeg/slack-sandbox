from logging import Logger

from slack_bolt import Say


def greeting(say: Say, logger: Logger):
    try:
        say("'sup")
    except Exception as e:
        logger.error(e)
