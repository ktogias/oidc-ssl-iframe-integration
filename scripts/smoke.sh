#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://portal.local}"
PORTAL_URL="$BASE_URL/"
PARTNER_URL="$BASE_URL/partner/"
VERIFY_TLS="${VERIFY_TLS:-false}"
CURL_COMMON_OPTS=(-sS)

if [[ "$VERIFY_TLS" != "true" ]]; then
  CURL_COMMON_OPTS+=(-k)
fi

status_code() {
  local url=$1
  curl "${CURL_COMMON_OPTS[@]}" -o /dev/null -w "%{http_code}" "$url"
}

portal_status=$(status_code "$PORTAL_URL")
if [[ "$portal_status" != "200" ]]; then
  echo "[smoke] Portal root expected 200 but got $portal_status" >&2
  exit 1
fi

echo "[smoke] Portal root reachable (HTTP $portal_status)."

# Partner route should redirect to Keycloak for authentication
# Capture headers to assert redirect target.
mapfile -t partner_headers < <(curl "${CURL_COMMON_OPTS[@]}" -o /dev/null -D - "$PARTNER_URL")
partner_code=$(printf '%s
' "${partner_headers[@]}" | awk 'NR==1{print $2}')
location_header=$(printf '%s
' "${partner_headers[@]}" | awk 'BEGIN{IGNORECASE=1}/^location:/ {print $2}' | tr -d '\r')

if [[ "$partner_code" != "302" && "$partner_code" != "303" ]]; then
  echo "[smoke] Partner route should redirect (302/303) but returned $partner_code" >&2
  exit 1
fi

if [[ -z "$location_header" || "$location_header" != https://keycloak.local* ]]; then
  echo "[smoke] Unexpected redirect target for partner route: $location_header" >&2
  exit 1
fi

echo "[smoke] Partner route redirects to $location_header"

echo "[smoke] All checks passed."
