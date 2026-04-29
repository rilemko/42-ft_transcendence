#### CONFIGURATION #############################################

FROM        debian:12-slim

ARG         CONFIG_USR_ADD=''
ARG         CONFIG_USR_USE='postgres'

ARG         CONFIG_INI_PKG='postgresql-15'
ARG         CONFIG_INI_DIR='app/storage'

EXPOSE      5000

#### BUILDING ##################################################

RUN         apt-get -y update                                                   \
            && apt-get -y install curl ${CONFIG_INI_PKG}                        \
            && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN         if [ -z "${CONFIG_USR_ADD}" ]; then return 0; fi;                   \
            echo "${CONFIG_USR_ADD}" | grep -E "^[A-Za-z-]+:[0-9]+:[0-9]+$"     \
            || exit 1;                                                          \
            usr="$(echo ${CONFIG_USR_ADD} | cut -d ':' -f 1)";                  \
            uid="$(echo ${CONFIG_USR_ADD} | cut -d ':' -f 2)";                  \
            gid="$(echo ${CONFIG_USR_ADD} | cut -d ':' -f 3)";                  \
            groupadd -fr -g "${gid}" "${usr}"                                   \
            && useradd -Mr -u "${uid}" -g "${gid}" "${usr}"

RUN         for i in ${CONFIG_INI_DIR}; do                                      \
                echo "${i}" | grep -E "^[A-Za-z_/.-]+(:[0-9]+)?(:[A-Za-z]+)?$"  \
                || exit 1;                                                      \
                dir=$(echo ${i} | cut -d ':' -f 1);                             \
                sep="$(echo -n "${dir}" | tr -cd ':' | wc -c)";                 \
                mkdir -p "/${dir}";                                             \
                if [ "${sep}" -gt 0 ];                                          \
                then chmod -R "$(echo ${i} | cut -d ':' -f 2)" "/${dir}";       \
                else chmod -R 700 "/${dir}"; fi;                                \
                if [ "${sep}" == 2 ];                                           \
                then chown -R "$(echo ${i} | cut -d ':' -f 3)" "/${dir}";       \
                else chown -R "${CONFIG_USR_USE}" "/${dir}"; fi;                \
            done

COPY        . "/app"
RUN         chmod -R 755 "/app" && chown -R "${CONFIG_USR_USE}" "/app"

### HEALTHCHECK ################################################

HEALTHCHECK --start-period=15m --start-interval=10s --interval=5m --timeout=5s  \
            --retries=3 CMD sh /app/bootstrap/healthcheck.sh

#### EXECUTION #################################################

USER        ${CONFIG_USR_USE}
ENTRYPOINT  ["sh", "/app/bootstrap/bootstrap.sh"]
