#!/usr/bin/env bash
set -euo pipefail

CA_SRC="/etc/apache2/tls/portal-dev-ca.crt"
CA_DST="/usr/local/share/ca-certificates/portal-dev-ca.crt"
TEMPLATE_CONF="/etc/apache2/sites-available/portal.conf.template"
ACTIVE_CONF="/etc/apache2/sites-available/portal.conf"

if [[ -f "$CA_SRC" ]]; then
  cp "$CA_SRC" "$CA_DST"
  update-ca-certificates >/dev/null 2>&1 || true
fi

if [[ -f "$TEMPLATE_CONF" ]]; then
  envsubst '${OIDC_PARTNER_PROXY_SECRET} ${OIDC_CRYPTO_PASSPHRASE}' \
    < "$TEMPLATE_CONF" > "$ACTIVE_CONF"
fi

a2ensite portal.conf

exec apachectl -D FOREGROUND
