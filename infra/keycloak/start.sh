#!/usr/bin/env bash
set -euo pipefail

IMPORT_DIR=/opt/keycloak/data/import
TEMPLATE=$IMPORT_DIR/realm-export.json.template
RENDERED=$IMPORT_DIR/realm-export.json
TEMP_FILE=$IMPORT_DIR/realm-export.json.tmp

escape_sed() {
  printf '%s' "$1" | sed -e 's/[\\/&]/\\&/g'
}

if [[ -f "$TEMPLATE" ]]; then
  : "${DEMO_USER_USERNAME:=demo.user}"
  : "${DEMO_USER_EMAIL:=demo.user@example.com}"
  : "${DEMO_USER_FIRST_NAME:=Demo}"
  : "${DEMO_USER_LAST_NAME:=User}"
  : "${DEMO_USER_PASSWORD:=changeMe123}"

  SECRET=$(escape_sed "$OIDC_PARTNER_PROXY_SECRET")
  USERNAME=$(escape_sed "$DEMO_USER_USERNAME")
  EMAIL=$(escape_sed "$DEMO_USER_EMAIL")
  FIRST_NAME=$(escape_sed "$DEMO_USER_FIRST_NAME")
  LAST_NAME=$(escape_sed "$DEMO_USER_LAST_NAME")
  PASSWORD=$(escape_sed "$DEMO_USER_PASSWORD")

  sed -e "s/CHANGE_ME_PARTNER_PROXY_SECRET/${SECRET}/g" \
      -e "s/__DEMO_USER_USERNAME__/${USERNAME}/g" \
      -e "s/__DEMO_USER_EMAIL__/${EMAIL}/g" \
      -e "s/__DEMO_USER_FIRST_NAME__/${FIRST_NAME}/g" \
      -e "s/__DEMO_USER_LAST_NAME__/${LAST_NAME}/g" \
      -e "s/__DEMO_USER_PASSWORD__/${PASSWORD}/g" \
      "$TEMPLATE" > "$TEMP_FILE"

  mv "$TEMP_FILE" "$RENDERED"
fi

exec /opt/keycloak/bin/kc.sh start --optimized --import-realm
