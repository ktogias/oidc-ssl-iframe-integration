#!/usr/bin/env bash
set -euo pipefail

IMPORT_DIR=/opt/keycloak/data/import
TEMPLATE=$IMPORT_DIR/realm-export.json.template
RENDERED=$IMPORT_DIR/realm-export.json
TEMP_FILE=$IMPORT_DIR/realm-export.json.tmp

if [[ -f "$TEMPLATE" ]]; then
  sed "s/CHANGE_ME_PARTNER_PROXY_SECRET/${OIDC_PARTNER_PROXY_SECRET}/g" \
    "$TEMPLATE" > "$TEMP_FILE"
  mv "$TEMP_FILE" "$RENDERED"
fi

exec /opt/keycloak/bin/kc.sh start --optimized --import-realm
