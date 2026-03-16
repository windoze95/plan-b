#!/bin/sh
envsubst < /etc/plan-b/config.js.template > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
