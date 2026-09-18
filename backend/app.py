from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.notes import notes_bp
from routes.categories import categories_bp
from routes.tags import tags_bp
from routes.dashboard import dashboard_bp


def create_app():
    app = Flask(__name__)
    CORS(app, origins=Config.CORS_ORIGINS)

    app.register_blueprint(notes_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(tags_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
