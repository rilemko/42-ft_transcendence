#!/bin/sh
redis-cli -p "${T_PORT_INTERN_CACHING}" --user "${T_REDIS_USERNAME}" -a "${T_REDIS_PASSWORD}" ping | grep PONG

