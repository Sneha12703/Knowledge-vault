from flask import Blueprint, jsonify
from db import get_cursor

tags_bp = Blueprint("tags", __name__, url_prefix="/api/tags")


@tags_bp.route("", methods=["GET"])
def list_tags():
    with get_cursor() as cur:
        cur.execute("SELECT id, name FROM tags ORDER BY name")
        rows = cur.fetchall()
    return jsonify(rows), 200
