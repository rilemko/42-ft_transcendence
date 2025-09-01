#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    if [ -z ${T_SELF_REPO} ]
    then fn_log_fail "No remote repository specified." && exit 1;
    else fn_download "${T_SELF_REPO}" "/app/service" || exit 1; fi

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/service" &&
./postgres_exporter                                                             \
    --config.file="/app/config/postgres_exporter.yml"                           \
    --web.listen-address=":${T_PORT_INTERN_METRICS}"                            \
    --web.telemetry-path="/${T_ENDPOINT_METRICS}"
