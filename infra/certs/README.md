# TLS Material

Development builds reuse a single internal certificate authority (CA) so both Apache and Keycloak trust each other while exposing HTTPS endpoints to the host. Generate the files once and mount them into the containers defined in `docker-compose.yml` (to be added).

> **Tip:** Run `./scripts/bootstrap.sh` to generate every artifact automatically (requires `openssl` + `keytool`). The manual commands below remain available if you prefer to craft the files yourself.

## Step-by-step
1. **Create a local CA**
   ```bash
   openssl req -x509 -nodes -new -sha256 -days 3650 \
     -subj "/C=US/ST=CA/O=PortalDev/OU=CA/CN=Portal Dev CA" \
     -keyout portal-dev-ca.key -out portal-dev-ca.crt
   ```
2. **Issue a cert for Apache (`portal.localhost`)**
   ```bash
   openssl req -new -nodes \
     -subj "/C=US/ST=CA/O=PortalDev/CN=portal.localhost" \
     -keyout portal-dev.key -out portal-dev.csr
   openssl x509 -req -sha256 -days 825 \
     -in portal-dev.csr -CA portal-dev-ca.crt -CAkey portal-dev-ca.key -CAcreateserial \
     -out portal-dev.crt -extensions v3_req -extfile <(cat <<'EOT'
   [v3_req]
   subjectAltName=DNS:portal.localhost,DNS:partner.localhost
   EOT
   )
   ```
3. **Issue a cert for Keycloak (`keycloak.localhost`)**
   ```bash
   openssl req -new -nodes \
     -subj "/C=US/ST=CA/O=PortalDev/CN=keycloak.localhost" \
     -keyout keycloak-dev.key -out keycloak-dev.csr
   openssl x509 -req -sha256 -days 825 \
     -in keycloak-dev.csr -CA portal-dev-ca.crt -CAkey portal-dev-ca.key -CAcreateserial \
     -out keycloak-dev.crt -extensions v3_req -extfile <(cat <<'EOT'
   [v3_req]
   subjectAltName=DNS:keycloak.localhost
   EOT
   )
   ```
4. **Build a truststore for Keycloak** (so it trusts the Apache CA chain when doing backchannel calls)
   ```bash
   keytool -importcert -noprompt \
     -alias portal-dev-ca -file portal-dev-ca.crt \
     -keystore portal-dev-ca.jks -storepass changeit
   ```

5. **File layout** (mount into containers):
   ```
   infra/certs/
   ├── keycloak-dev.crt
   ├── keycloak-dev.key
   ├── portal-dev-ca.crt
   ├── portal-dev-ca.jks
   ├── portal-dev.crt
   └── portal-dev.key
   ```

Add this directory to `.gitignore` because the generated keys should never be committed. The files listed above are intentionally absent from the repository; only this guide lives under version control.
