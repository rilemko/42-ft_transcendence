#!/bin/sh
curl -Ls -u elastic:${T_ELASTIC_ROOTPASS} "http://${T_SELF_NAME}:${T_PORT_INTERN_LOGGING}/${T_ENDPOINT_LOGGING}/api/status" -w "%{http_code}" -o "/dev/null" |
grep -q "200"
