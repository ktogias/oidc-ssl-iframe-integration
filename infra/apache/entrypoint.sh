#!/usr/bin/env bash
set -euo pipefail

CA_SRC="/etc/apache2/tls/portal-dev-ca.crt"
CA_DST="/usr/local/share/ca-certificates/portal-dev-ca.crt"

if [[ -f "$CA_SRC" ]]; then
  cp "$CA_SRC" "$CA_DST"
  update-ca-certificates >/dev/null 2>&1 || true
fi

exec apachectl -D FOREGROUND
