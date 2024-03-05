import sqlite3

from handlers import messaging


class Database:
    def __init__(self, path: str):
        self.connection = sqlite3.connect(path, check_same_thread=False)
        self.create_tables()

    # Prepares places to persist data
    def create_tables(self):
        cursor = self.connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS threads (
                thread_ts TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                team_id TEXT NOT NULL,
                PRIMARY KEY (thread_ts, channel_id, team_id)
            )
        """)
        self.connection.commit()

    # Returns if the thread is currently being followed
    def threads_following_check(self, event) -> (bool, str):
        thread_ts = messaging.get_event_thread_ts(event)
        channel_id = event['channel']
        team_id = event['team']

        cursor = self.connection.cursor()
        response = cursor.execute("""
            SELECT * FROM threads
            WHERE
                thread_ts=?
                AND channel_id=?
                AND team_id=?
        """, (thread_ts, channel_id, team_id))

        exists = response.fetchone() is not None
        return exists, thread_ts

    # Marks the provided thread as one to follow
    def threads_following_watch(self, event):
        thread_ts = messaging.get_event_thread_ts(event)
        channel_id = event['channel']
        team_id = event['team']

        cursor = self.connection.cursor()
        cursor.execute("""
            INSERT INTO threads (thread_ts, channel_id, team_id)
            VALUES (?, ?, ?)
        """, (thread_ts, channel_id, team_id))
        self.connection.commit()

    # Ends the open connections
    def close(self):
        self.connection.close()
