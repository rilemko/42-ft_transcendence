#!/bin/sh
curl -u ${T_LOGSTASH_USERNAME}:${T_LOGSTASH_PASSWORD} -Ls "http://localhost:${T_PORT_INTERN_LOGGING}" -w "%{http_code}" -o "/dev/null" |
grep -q "200"

