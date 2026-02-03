#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
CERTS_DIR="$ROOT_DIR/infra/certs"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"
CA_KEY="$CERTS_DIR/portal-dev-ca.key"
CA_CRT="$CERTS_DIR/portal-dev-ca.crt"
TRUSTSTORE="$CERTS_DIR/portal-dev-ca.jks"

log() {
  echo "[bootstrap] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[bootstrap] Missing required command: $1" >&2
    exit 1
  fi
}

ensure_certs_dir() {
  mkdir -p "$CERTS_DIR"
}

generate_ca() {
  if [[ -f "$CA_KEY" && -f "$CA_CRT" ]]; then
    log "CA already exists, skipping generation."
    return
  fi
  log "Generating development certificate authority..."
  openssl req -x509 -nodes -new -sha256 -days 3650 \
    -subj "/C=US/ST=CA/O=PortalDev/OU=CA/CN=Portal Dev CA" \
    -keyout "$CA_KEY" -out "$CA_CRT"
}

sign_cert() {
  local name=$1
  local cn=$2
  local san=$3
  local key="$CERTS_DIR/${name}.key"
  local csr="$CERTS_DIR/${name}.csr"
  local crt="$CERTS_DIR/${name}.crt"

  if [[ -f "$key" && -f "$crt" ]]; then
    log "Certificate for $cn already exists, skipping."
    return
  fi

  log "Generating certificate for $cn ($name)..."
  openssl req -new -nodes -newkey rsa:2048 \
    -subj "/C=US/ST=CA/O=PortalDev/CN=$cn" \
    -keyout "$key" -out "$csr"

  local ext_file
  ext_file=$(mktemp)
  {
    echo "[v3_req]"
    echo "subjectAltName=$san"
  } >"$ext_file"

  openssl x509 -req -sha256 -days 825 \
    -in "$csr" -CA "$CA_CRT" -CAkey "$CA_KEY" -CAcreateserial \
    -out "$crt" -extensions v3_req -extfile "$ext_file"

  rm -f "$ext_file"
}

build_truststore() {
  if [[ -f "$TRUSTSTORE" ]]; then
    log "Truststore already exists, skipping."
    return
  fi
  log "Creating Keycloak truststore..."
  keytool -importcert -noprompt \
    -alias portal-dev-ca -file "$CA_CRT" \
    -keystore "$TRUSTSTORE" -storepass changeit >/dev/null
}

bootstrap_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    log ".env already present, skipping."
    return
  fi
  log "Creating .env from template..."
  local partner_secret crypto_pass
  partner_secret=$(openssl rand -hex 24)
  crypto_pass=$(openssl rand -hex 24)
  cat >"$ENV_FILE" <<EOF2
KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN:-admin}
KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
OIDC_PARTNER_PROXY_SECRET=${OIDC_PARTNER_PROXY_SECRET:-$partner_secret}
OIDC_CRYPTO_PASSPHRASE=${OIDC_CRYPTO_PASSPHRASE:-$crypto_pass}
EOF2
  log "Wrote $ENV_FILE"
}

main() {
  require_cmd openssl
  require_cmd keytool
  ensure_certs_dir
  generate_ca
  sign_cert "portal-dev" "portal.localhost" "DNS:portal.localhost,DNS:partner.localhost"
  sign_cert "keycloak-dev" "keycloak.localhost" "DNS:keycloak.localhost,DNS:keycloak"
  build_truststore
  bootstrap_env_file
  log "Bootstrap complete. You can now run 'docker compose up --build'."
}

main "$@"
