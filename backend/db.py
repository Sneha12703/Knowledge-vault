import pymysql
import pymysql.cursors
from contextlib import contextmanager

from config import Config


def get_connection():
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        db=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


@contextmanager
def get_cursor(commit: bool = False):
    """
    Yields a DictCursor (rows come back as dicts, easy to jsonify).
    Opens and closes a fresh connection per call - fine for a small
    single-user app; swap for a connection pool later if needed.
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
