#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    if [ -z ${T_SELF_BEAT} ]
    then fn_log_fail "No remote repository specified." && exit 1;
    else fn_download "${T_SELF_BEAT}" "/app/filebeat" || exit 1; fi

    export PATH="${PATH}:/usr/lib/postgresql/15/bin"

    if [ -z "$( ls -A '/app/storage' )" ]
    then

        initdb -D "/app/storage"
        pg_ctl -D "/app/storage" start
        psql   -f "/app/config/postgresql.sql"
        pg_ctl -D "/app/storage" stop

    fi;

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/filebeat" && ./filebeat -e -c /app/config/filebeat.yml &
postgres --config_file="/app/config/pgsql.conf"
