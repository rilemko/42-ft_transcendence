import redis
from os import environ

r = redis.StrictRedis(host='redis', port=int(environ.get('T_PORT_INTERN_CACHING')), db=int(environ.get('T_SELF_REDIS_ID')))
