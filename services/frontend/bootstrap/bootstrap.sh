#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    if [ -z ${T_SELF_BEAT} ]
    then fn_log_fail "No remote repository specified." && exit 1;
    else fn_download "${T_SELF_BEAT}" "/app/filebeat" || exit 1; fi

    cd /app/service
    npm config set fetch-timeout 1200000
    npm config set fetch-retries 20
    npm config set fetch-retry-mintimeout 1200000
    npm config set fetch-retry-maxtimeout 1800000
    npm install -g serve || exit 0
    npm install || exit 0

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/filebeat" && ./filebeat -e -c /app/config/filebeat.yml &
cd /app/service &&
npm run build
serve -s dist -l ${T_PORT_INTERN_BACKEND} | tee -a "/app/logs/react.log"
