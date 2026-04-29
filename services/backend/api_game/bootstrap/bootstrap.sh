#!/bin/sh
#### INITIALIZATION ############################################

if [ ! -f "/app/.init" ] || [ "$(< "/app/.init")" != "true" ]
then . "/app/bootstrap/functions.sh"

    if [ "${T_SELF_REDIS_ID}" -gt "$((T_REDIS_DB_COUNT - 1))" ]
    then fn_log_fail "Not enough Redis database." && exit 1; fi

    python3 -m venv /app/venv
    /app/venv/bin/pip install --no-cache-dir -r /app/config/requirements.txt

    rm -f "/app/.init" && echo "true" > "/app/.init"
fi;

#### EXECUTION #################################################

cd "/app/service"                                                               \
&& . "/app/venv/bin/activate"                                                   \
&& python3 manage.py makemigrations                                             \
&& python3 manage.py migrate                                                    \
&& python3 -m daphne -b 0.0.0.0 -p ${T_PORT_INTERN_BACKEND} service.asgi:application
