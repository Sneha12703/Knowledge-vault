from flask import Blueprint, jsonify
from db import get_cursor

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("", methods=["GET"])
def get_dashboard():
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) AS total FROM notes")
        total_notes = cur.fetchone()["total"]

        cur.execute("SELECT COUNT(*) AS total FROM categories")
        total_categories = cur.fetchone()["total"]

        cur.execute(
            """
            SELECT n.id, n.title, n.updated_at, c.name AS category_name
            FROM notes n
            LEFT JOIN categories c ON c.id = n.category_id
            ORDER BY n.updated_at DESC
            LIMIT 5
            """
        )
        recent = cur.fetchall()

    return jsonify({
        "total_notes": total_notes,
        "total_categories": total_categories,
        "recent_notes": [
            {
                "id": r["id"],
                "title": r["title"],
                "category_name": r["category_name"],
                "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
            }
            for r in recent
        ],
    }), 200
