FROM quay.io/keycloak/keycloak:24.0.2

USER root

COPY keycloak.conf /opt/keycloak/conf/keycloak.conf
RUN mkdir -p /opt/keycloak/data/import
COPY realm-export.json.template /opt/keycloak/data/import/realm-export.json.template
COPY start.sh /opt/keycloak/bin/start-with-import.sh
RUN chmod +x /opt/keycloak/bin/start-with-import.sh

USER keycloak
