from __future__ import annotations

import json
from typing import Dict, List

from flask import Flask, jsonify, render_template, request

IDENTITY_HEADERS: Dict[str, str] = {
    "username": "X-User-Name",
    "email": "X-User-Email",
    "roles": "X-User-Roles",
}


def _parse_roles(raw_value: str) -> List[str]:
    try:
        parsed = json.loads(raw_value)
        if isinstance(parsed, list):
            return [str(role) for role in parsed]
    except json.JSONDecodeError:
        pass
    candidates = [token.strip() for token in raw_value.replace(",", " ").split(" ")]
    return [token for token in candidates if token]


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates")

    @app.route("/")
    def index() -> str:
        return render_template("index.html", header_map=IDENTITY_HEADERS)

    @app.route("/claims")
    def claims():
        payload = {}
        for key, header in IDENTITY_HEADERS.items():
            value = request.headers.get(header)
            if not value:
                continue
            if key == "roles":
                payload[key] = _parse_roles(value)
            else:
                payload[key] = value
        return jsonify({"claims": payload, "headers": dict(request.headers)})

    @app.route("/healthz")
    def healthz():
        return jsonify({"status": "ok"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
