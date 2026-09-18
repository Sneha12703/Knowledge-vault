from flask import Blueprint, request, jsonify
from db import get_cursor

notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")


def _serialize_note(row, tags=None):
    def fmt(dt):
        return dt.isoformat() if dt else None

    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"],
        "category_id": row["category_id"],
        "category_name": row.get("category_name"),
        "tags": tags if tags is not None else [],
        "created_at": fmt(row.get("created_at")),
        "updated_at": fmt(row.get("updated_at")),
    }


def _get_tags_for_note(cur, note_id):
    cur.execute(
        """
        SELECT t.id, t.name
        FROM tags t
        JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = %s
        ORDER BY t.name
        """,
        (note_id,),
    )
    return cur.fetchall()


def _get_or_create_tag_id(cur, name):
    cur.execute("SELECT id FROM tags WHERE name = %s", (name,))
    row = cur.fetchone()
    if row:
        return row["id"]
    cur.execute("INSERT INTO tags (name) VALUES (%s)", (name,))
    return cur.lastrowid


def _set_tags_for_note(cur, note_id, tag_names):
    cur.execute("DELETE FROM note_tags WHERE note_id = %s", (note_id,))
    for raw_name in tag_names:
        name = raw_name.strip()
        if not name:
            continue
        tag_id = _get_or_create_tag_id(cur, name)
        cur.execute(
            "INSERT IGNORE INTO note_tags (note_id, tag_id) VALUES (%s, %s)",
            (note_id, tag_id),
        )


def _fetch_note_row(cur, note_id):
    cur.execute(
        """
        SELECT n.id, n.title, n.content, n.category_id, n.created_at, n.updated_at,
               c.name AS category_name
        FROM notes n
        LEFT JOIN categories c ON c.id = n.category_id
        WHERE n.id = %s
        """,
        (note_id,),
    )
    return cur.fetchone()


@notes_bp.route("", methods=["GET"])
def list_notes():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    tag = request.args.get("tag", "").strip()

    query = """
        SELECT DISTINCT n.id, n.title, n.content, n.category_id, n.created_at, n.updated_at,
               c.name AS category_name
        FROM notes n
        LEFT JOIN categories c ON c.id = n.category_id
        LEFT JOIN note_tags nt ON nt.note_id = n.id
        LEFT JOIN tags t ON t.id = nt.tag_id
        WHERE 1 = 1
    """
    params = []

    if search:
        query += " AND (n.title LIKE %s OR n.content LIKE %s)"
        like = f"%{search}%"
        params.extend([like, like])

    if category:
        query += " AND c.name = %s"
        params.append(category)

    if tag:
        query += " AND t.name = %s"
        params.append(tag)

    query += " ORDER BY n.updated_at DESC"

    with get_cursor() as cur:
        cur.execute(query, params)
        rows = cur.fetchall()
        result = []
        for row in rows:
            tags = _get_tags_for_note(cur, row["id"])
            result.append(_serialize_note(row, [t["name"] for t in tags]))

    return jsonify(result), 200


@notes_bp.route("/<int:note_id>", methods=["GET"])
def get_note(note_id):
    with get_cursor() as cur:
        row = _fetch_note_row(cur, note_id)
        if not row:
            return jsonify({"error": "Note not found"}), 404
        tags = _get_tags_for_note(cur, note_id)

    return jsonify(_serialize_note(row, [t["name"] for t in tags])), 200


@notes_bp.route("", methods=["POST"])
def create_note():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    content = data.get("content") or ""
    category_id = data.get("category_id")
    tags = data.get("tags") or []

    if not title:
        return jsonify({"error": "Title is required"}), 400

    with get_cursor(commit=True) as cur:
        cur.execute(
            "INSERT INTO notes (title, content, category_id) VALUES (%s, %s, %s)",
            (title, content, category_id),
        )
        note_id = cur.lastrowid
        _set_tags_for_note(cur, note_id, tags)
        note = _fetch_note_row(cur, note_id)
        new_tags = _get_tags_for_note(cur, note_id)

    return jsonify(_serialize_note(note, [t["name"] for t in new_tags])), 201


@notes_bp.route("/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    content = data.get("content") or ""
    category_id = data.get("category_id")
    tags = data.get("tags") or []

    if not title:
        return jsonify({"error": "Title is required"}), 400

    with get_cursor(commit=True) as cur:
        cur.execute("SELECT id FROM notes WHERE id = %s", (note_id,))
        if not cur.fetchone():
            return jsonify({"error": "Note not found"}), 404

        cur.execute(
            """
            UPDATE notes
            SET title = %s, content = %s, category_id = %s
            WHERE id = %s
            """,
            (title, content, category_id, note_id),
        )
        _set_tags_for_note(cur, note_id, tags)
        note = _fetch_note_row(cur, note_id)
        new_tags = _get_tags_for_note(cur, note_id)

    return jsonify(_serialize_note(note, [t["name"] for t in new_tags])), 200


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    with get_cursor(commit=True) as cur:
        cur.execute("SELECT id FROM notes WHERE id = %s", (note_id,))
        if not cur.fetchone():
            return jsonify({"error": "Note not found"}), 404
        cur.execute("DELETE FROM notes WHERE id = %s", (note_id,))

    return "", 204
