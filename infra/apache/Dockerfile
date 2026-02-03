FROM debian:bookworm-slim

ENV APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2 \
    APACHE_PID_FILE=/var/run/apache2/apache2.pid

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       apache2 libapache2-mod-auth-openidc ca-certificates gettext-base \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod ssl headers proxy proxy_http proxy_wstunnel proxy_html rewrite auth_openidc \
    && a2dissite 000-default

COPY html /var/www/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

CMD ["/entrypoint.sh"]
