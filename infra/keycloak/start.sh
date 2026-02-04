#!/usr/bin/env bash
set -euo pipefail

IMPORT_DIR=/opt/keycloak/data/import
TEMPLATE=$IMPORT_DIR/realm-export.json.template
RENDERED=$IMPORT_DIR/realm-export.json
TEMP_FILE=$IMPORT_DIR/realm-export.json.tmp

if [[ -f "$TEMPLATE" ]]; then
  : "${DEMO_USER_USERNAME:=demo.user}"
  : "${DEMO_USER_EMAIL:=demo.user@example.com}"
  : "${DEMO_USER_FIRST_NAME:=Demo}"
  : "${DEMO_USER_LAST_NAME:=User}"
  : "${DEMO_USER_PASSWORD:=changeMe123}"

  VARIABLES='${OIDC_PARTNER_PROXY_SECRET} ${DEMO_USER_USERNAME} ${DEMO_USER_EMAIL} ${DEMO_USER_FIRST_NAME} ${DEMO_USER_LAST_NAME} ${DEMO_USER_PASSWORD}'

  envsubst "$VARIABLES" < "$TEMPLATE" > "$TEMP_FILE"
  mv "$TEMP_FILE" "$RENDERED"
fi

exec /opt/keycloak/bin/kc.sh start --optimized --import-realm
