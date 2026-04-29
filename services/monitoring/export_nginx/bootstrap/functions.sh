#### DOWNLOAD ##################################################

fn_download()
{
    if [ -z "${1}" ] || [ -z "${2}" ]
    then return 1; fi

    rm -rf "${2}" && mkdir "${2}"                                               \
    && (curl -Ls "${1}" | tar -xvz -C "${2}") || return 1

    local d=$(ls -A "${2}")
    if [ $(echo "${d}" | wc -w) -eq 1 ]
    then mv "${2}/${d}"/* "${2}/" && rm -fr "${2}/${d}" || return 1; fi
}

#### LOGGING ###################################################

fn_log_dump()
{
    if [ -n "${1}" ]
    then echo "[\033[1;37m•\033[0m] ${1}"; fi
}

fn_log_fail()
{
    if [ -n "${1}" ]
    then echo "[\033[1;31m•\033[0m] ${1}"; fi
}

fn_log_info()
{
    if [ -n "${1}" ]
    then echo "[\033[1;34m•\033[0m] ${1}"; fi
}

fn_log_warn()
{
    if [ -n "${1}" ]
    then echo "[\033[1;33m•\033[0m] ${1}"; fi
}

#### ENVSUBST ##################################################

fn_putenv_d()
{
    if [ -n "${1}" ] && [ -d "${1}" ]
    then find "${1}" -type f | while read -r file; do fn_putenv_f "${file}"; done; fi
}

fn_putenv_f()
{
    if [ -n "${1}" ] && [ -f "${1}" ]
    then
        for key in $(env | grep -e "^T_" | awk -F= '{print $1}'); do
            val="$(env | grep -e "^${key}=" | awk -F= '{print $2}')";
            sed -i "s|\${$key}|${val}|g" "${1}";
        done
    fi
}
