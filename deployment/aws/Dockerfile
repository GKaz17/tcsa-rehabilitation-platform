FROM php:8.3-fpm-bookworm
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor ca-certificates libonig-dev \
    && docker-php-ext-install -j2 mbstring pdo_mysql \
    && php -r 'if (!defined("PASSWORD_ARGON2ID") || !extension_loaded("pdo_mysql") || !extension_loaded("mbstring")) exit(1);' \
    && rm -rf /var/lib/apt/lists/* \
    && install -d -m 0700 -o www-data -g www-data /tmp/tcsa-sessions
WORKDIR /var/www/tcsa
COPY public/ ./public/
COPY api/ ./api/
COPY aws/nginx.conf /etc/nginx/nginx.conf
COPY aws/php.ini /usr/local/etc/php/conf.d/zz-tcsa.ini
COPY aws/php-fpm.conf /usr/local/etc/php-fpm.d/zzzz-tcsa.conf
COPY aws/supervisord.conf /etc/supervisor/conf.d/tcsa.conf
COPY aws/rds-ca.pem /etc/ssl/certs/tcsa-rds.pem
ENV APP_ENV=production SESSION_NAME=TCSA_SESSION SESSION_PATH=/tmp/tcsa-sessions DB_SSL_CA=/etc/ssl/certs/tcsa-rds.pem
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD php -r '$r = @file_get_contents("http://127.0.0.1:8080/api/health.php"); if (!$r || (json_decode($r, true)["data"]["status"] ?? "") !== "ok") exit(1);'
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/tcsa.conf"]
