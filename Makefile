# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mconreau <mconreau@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/28 16:35:52 by mconreau          #+#    #+#              #
#    Updated: 2024/10/03 12:17:53 by mconreau         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#///// PROJECT : CONFIGURATION ////////////////////////////////////////////////#

# > GENERAL <<<<<<<<<<<<<<

PROJECT_NAME			:=	transcendence
PROJECT_VERSION			:=	0.0.1

#///// MAKEFILE : COMMANDS ////////////////////////////////////////////////////#

$(PROJECT_NAME)			:
							@docker compose -p $(PROJECT_NAME) -f docker-compose.yml up --build

all						:	$(PROJECT_NAME)

ps						:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) ps

start					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) start

stop					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) stop

restart					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) restart

down					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) down

clean					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) down --rmi all

fclean					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) down --rmi all -v

vclean					:
							@docker compose -f docker-compose.yml -p $(PROJECT_NAME) down -v

cclean					:
							@docker system prune -a -f > /dev/null

re						:	clean all

.PHONY					:	all ps start stop restart clean fclean vclean cclean down re
