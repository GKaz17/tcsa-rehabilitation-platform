#!/bin/sh
set -eu
# Azure's persistent /home volume maps file ownership to nobody:nogroup.
# PHP's files session handler rejects session files owned by another UID.
# Apply this after the image's default pool config on every container start.
cat > /usr/local/etc/php-fpm.d/zzzz-tcsa-session.conf <<'PHP_FPM'
[www]
user = nobody
group = nogroup
PHP_FPM
php-fpm -t
cp /home/site/wwwroot/deployment/azure-nginx.conf /etc/nginx/sites-available/default
nginx -t
service nginx reload
