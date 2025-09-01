#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    if [ -z ${T_SELF_REPO} ]
    then fn_log_fail "No remote repository specified." && exit 1;
    else fn_download "${T_SELF_REPO}" "/app/service" || exit 1; fi

    cp -rf /app/config/* "/app/service/config/"

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/service/bin" &&
./logstash
