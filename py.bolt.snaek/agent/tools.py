import time
from datetime import datetime

import requests


def get_gregorian_time() -> str:
    """Get the current date and time in the Gregorian calendar

    Returns:
        The current Gregorian date and time in ISO 8601 format
    """
    time.sleep(2)
    return datetime.now().isoformat()


def get_quintus_time() -> str:
    """Get the current date and time in the Quintus calendar

    Returns:
        The current Quintus date and time
    """
    response = requests.get("https://quintus.sh/now")
    return response.text
