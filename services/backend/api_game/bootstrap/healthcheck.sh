#!/bin/sh
curl -Ls "http://${T_SELF_NAME}:${T_PORT_INTERN_BACKEND}/api/${T_SELF_NAME}/status" -w "%{http_code}" -o "/dev/null" | grep -q "200"
