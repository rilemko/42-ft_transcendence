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
        while ! curl -Ls "http:/${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/_cluster/health" -w "%{http_code}" -o "/dev/null" |
        grep -q "401"; do sleep 5; done

        cd "/app/service/bin"

        ./elasticsearch-users useradd t_logstash -r t_logstash -p ${T_ELASTIC_SYSPASS_2}
        ./elasticsearch-users useradd t_exporter -r t_exporter -p ${T_ELASTIC_SYSPASS_3}

        printf "${T_ELASTIC_ROOTPASS}\n${T_ELASTIC_ROOTPASS}\n" | ./elasticsearch-reset-password -bfi -u "elastic" > "/dev/null"
        printf "${T_ELASTIC_SYSPASS_1}\n${T_ELASTIC_SYSPASS_1}\n" | ./elasticsearch-reset-password -bfi -u "kibana_system" > "/dev/null"

        for user in "apm_system" "beats_system" "kibana" "logstash_system" "remote_monitoring_user";
        do ./elasticsearch-reset-password -abf -u "${user}" > "/dev/null"; done

        ./elasticsearch-users useradd ${T_KIBANA_USERNAME} -r t_kibana -p ${T_KIBANA_PASSWORD}
    ) &

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/service/bin" &&
ES_JAVA_OPTS="-Xms${T_ELASTIC_AVMEMORY} -Xmx${T_ELASTIC_AVMEMORY}" ./elasticsearch
