#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -noenc                 \
        -subj   /C=FR/L=Nice/O=42/OU=mconreau/CN=${T_SERVER_NAME}               \
        -out    /app/ssl/transcendance.crt                                      \
        -keyout /app/ssl/transcendance.key                                      \
        > /dev/null 2> /dev/null

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

(sleep 2 && fn_log_info "Transcendence started !") &
nginx -c "/app/config/nginx.conf"
