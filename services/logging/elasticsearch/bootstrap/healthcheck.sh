#!/bin/sh
curl -Ls "http:/${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/_cluster/health" -w "%{http_code}" -o "/dev/null" | grep -q "401" \
&& curl -Ls -u "elastic:${T_ELASTIC_ROOTPASS}" "http://${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/_cluster/health" -w "%{http_code}" -o "/dev/null" | grep -q "200"
