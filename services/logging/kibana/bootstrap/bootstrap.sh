#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    fn_putenv_d "/app/config"

    if [ -z ${T_SELF_REPO} ]
    then fn_log_fail "No remote repository specified." && exit 1;
    else fn_download "${T_SELF_REPO}" "/app/service" || exit 1; fi

    cp -rf /app/config/* "/app/service/config/"

    (
        while ! curl -Ls -u kibana_system:${T_ELASTIC_SYSPASS_1} "http://${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/${T_ENDPOINT_LOGGING}/api/status" |
        grep -q '"status":{"overall":{"level":"available",'; do sleep 5; done

        find "/app/config/dataviews" "/app/config/dashboards" -type f -name "*.ndjson" | while read -r file;
        do
            curl -Ls -u elastic:${T_ELASTIC_ROOTPASS} -H "kbn-xsrf: string"         \
            "http://${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/${T_ENDPOINT_LOGGING}/api/saved_objects/_import?overwrite=true" \
            -F file=@"${file}"
        done
    ) &

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/service/bin" &&
./kibana
