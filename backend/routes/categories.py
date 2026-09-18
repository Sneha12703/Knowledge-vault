from flask import Blueprint, jsonify
from db import get_cursor

categories_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@categories_bp.route("", methods=["GET"])
def list_categories():
    with get_cursor() as cur:
        cur.execute("SELECT id, name FROM categories ORDER BY name")
        rows = cur.fetchall()
    return jsonify(rows), 200
