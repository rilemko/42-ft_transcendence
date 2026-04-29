<a id="readme-top" name="readme-top"></a>

<!-- ------------------------------
* TITLE, DESCRIPTION & CONTACT
------------------------------ -->
# 🚀 ft_transcendance

<table>
    <tr>
        <th align="left" width="3333px">Score</th>
        <th align="left" width="3333px">Duration</th>
        <th align="left" width="3333px">Peer(s)</th>
    </tr>
    <tr>
        <td>✅ <b>125</b> / 100</td>
        <td>🕓 12 week(s)</td>
        <td>👷🏻 Yes</td>
    </tr>
</table>

<br>

This team project is a full-stack web single-page application with the goal of reimagining the classic game of Pong as a modern, real-time multiplayer experience. The application was designed and deployed as a **Docker-based microservices architecture** emphasizing **scalability, security, and clean DevOps practices** and featuring **secure user authentication (credentials and OAuth 2.0)**, **real-time gameplay and matchmaking**, **responsive/compatible UI/UX** and **advanced 3D graphics**.


[**⛓️ FILE : SUBJECT**](en.subject.pdf)

<br>

<!-- ------------------------------
* TABLE OF CONTENTS
------------------------------ -->
## 📋 Table of contents

- [**👀 Overview**](#readme-overview)
- [**📦 Requirements**](#readme-requirements)
- [**💾 Installation**](#readme-installation)
- [**⚡️ Usage**](#readme-usage)
- [**🛠️ Makefile**](#readme-makefile)
- [**👷🏻 Collaborators**](#readme-collaborators)
- [**📄 License**](#readme-license)

<a id="readme-overview" name="readme-overview"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* OVERVIEW
------------------------------ -->
## 👀 Overview

### Technical stack

The project is built on a robust full-stack architecture combining modern web technologies, scalable infrastructure, and real-time features. architected as a modular, service-oriented system — with two distinct backends, each with its own database and scope. This separation ensures scalability, maintainability, and better domain isolation. Here's a breakdown of the stack:

🧠 **Backend**:

- **Auth API (Django)**: Handles authentication (OAuth2, 2FA, JWT), user profiles, avatars, friends, and session management. Backed by a dedicated **PostgreSQL** database for user-related data.
- **Game API (Django)**: Manages real-time game logic, matchmaking, tournaments, stats, and leaderboards. Backed by a separate **PostgreSQL** database optimized for game-related data.
- **Cache Layer**: **Redis** is used for session caching, real-time data (e.g. matchmaking queues), and pub/sub features between services.

🎨 **Frontend**:

- **React** with **Vite** for a blazing-fast single-page application
- **Node.js** used as the tooling and build environment

📊 **Monitoring & Logging**:

- **Prometheus, Grafana, and Alertmanager** for live metrics and alerting
- **Elasticsearch, Logstash, and Kibana (ELK)** stack for centralized logging and log analysis


### Modules

<details>
    <summary>See the list of available modules.</summary>
    <br>

#### Web

<table>
    <tr><td>Use a Framework as backend</td><td>🟢 10</td></tr>
    <tr><td>Use a front-end toolkit</td><td>🟢 5</td></tr>
    <tr><td>Use a database for the backend</td><td>🟢 5</td></tr>
    <tr><td>Store the score of a tournament in the Blockchain</td><td>🔴 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### User management

<table>
    <tr><td>User management, authentication, users across tournaments</td><td>🟢 10</td></tr>
    <tr><td>Remote authentication (OAuth 2.0)</td><td>🟢 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Gameplay and user experience

<table>
    <tr><td>Remote players</td><td>🟢 10</td></tr>
    <tr><td>Multiplayers (more than 2 in the same game)</td><td>🔴 10</td></tr>
    <tr><td>Add a second game with history and matchmaking</td><td>🔴 10</td></tr>
    <tr><td>Game customization options</td><td>🟢 5</td></tr>
    <tr><td>Live chat</td><td>🔴 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### AI / Algo

<table>
    <tr><td>AI opponent</td><td>🔴 10</td></tr>
    <tr><td>User and Game Stats Dashboards</td><td>🔴 5</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Cybersecurity

<table>
    <tr><td>WAF/ModSecurity and HashiCorp Vault</td><td>🔴 10</td></tr>
    <tr><td>GDPR Compliance</td><td>🔴 5</td></tr>
    <tr><td>Two-Factor Authentication (2FA) and JWT</td><td>🟢 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Devops

<table>
    <tr><td>Infrastructure Setup for Log Management</td><td>🟢 10</td></tr>
    <tr><td>Monitoring system</td><td>🟢 5</td></tr>
    <tr><td>Designing the Backend as Microservices</td><td>🟢 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Graphics

<table>
    <tr><td>Use of advanced 3D techniques</td><td>🟢 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Accessibility

<table>
    <tr><td>Support on all devices</td><td>🟢 5</td></tr>
    <tr><td>Expanding Browser Compatibility</td><td>🟢 5</td></tr>
    <tr><td>Multiple language supports</td><td>🔴 5</td></tr>
    <tr><td>dd accessibility for Visually Impaired Users</td><td>🔴 5</td></tr>
    <tr><td>Server-Side Rendering (SSR) Integration</td><td>🔴 5</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

#### Server-side game

<table>
    <tr><td>Replacing Basic Pong with Server-Side Pong and Imple-
menting an API</td><td>🟢 10</td></tr>
    <tr><td>Enabling Pong Gameplay via CLI against Web Users with
API Integration.</td><td>🔴 10</td></tr>
    <tr><th width="8800px"></th><th width="1200px"></th></tr>
</table>

</details>

<a id="readme-requirements" name="readme-requirements"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* REQUIREMENTS
------------------------------ -->
## 📦 Requirements

```
sudo apt -y install make
```

<a id="readme-installation" name="readme-installation"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* INSTALLATION
------------------------------ -->
## 💾 Installation

**1. Get the project**

```
git clone https://github.com/rilemko/42-ft_transcendance.git
```

<br>

**2. Install Docker**

```
sh docker_install.sh
```

> **🔵 Info:** You can also follow the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

<br>

**3. Setup the project**

```
cp .env.example .env
```

> **🟡 Important:** Don't forget to replace the information in the new `.env` file.

<br>

**4. Build the project**

```
make -j$(nproc)
```

<a id="readme-usage" name="readme-usage"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* USAGE
------------------------------ -->
## ⚡️ Usage

WIP



<a id="readme-makefile" name="readme-makefile"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* MAKEFILE
------------------------------ -->
## 🛠️ Makefile

<table>
    <tr>
        <th align="left" width="500px">Rule</th>
        <th align="left" width="9500px">Action</th>
    </tr>
    <tr><td><code>all</code></td><td>Build and run.</td></tr>
    <tr><td><code>ps</code></td><td>List all active project containers.</td></tr>
    <tr><td><code>start</code></td><td>Start project containers.</td></tr>
    <tr><td><code>stop</code></td><td>Stop project containers.</td></tr>
    <tr><td><code>restart</code></td><td>Restart project containers.</td></tr>
    <tr><td><code>down</code></td><td>Down the project containers.</td></tr>
    <tr><td><code>clean</code></td><td>Apply <code>down</code> and remove containers, images and networks.</td></tr>
    <tr><td><code>fclean</code></td><td>Apply <code>clean</code> and remove volumes.</td></tr>
    <tr><td><code>vclean</code></td><td>Apply <code>down</code> and remove volumes.</td></tr>
    <tr><td><code>cclean</code></td><td>Clear Docker cache.</td></tr>
    <tr><td><code>re</code></td><td>Apply <code>clean</code> then rebuild and run.</td></tr>
</table>

[**⛓️ FILE : MAKEFILE**](Makefile)

<a id="readme-collaborators" name="readme-collaborators"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* COLLABORATORS
------------------------------ -->
## 👷🏻 Collaborators

Maxime U. - [@LeMagicienToz](https://github.com/LeMagicienToz)\
Philémon O. - [@1Pepperoni](https://github.com/1Pepperoni)\
Raphaël D. - [@rdmrdm3](https://github.com/rdmrdm3)

<a id="readme-license" name="readme-license"></a>
<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>

<!-- ------------------------------
* LICENSE
------------------------------ -->
## 📄 License

This project is licensed under the terms of the **MIT** license.

[**⛓️ FILE : LICENSE**](LICENSE.md)

<p align="right"><b><a href="#readme-top">TOP ⬆️</a></b></p>
