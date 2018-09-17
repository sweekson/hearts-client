# Hearts Client
Hearts client for connecting to hearts server.

## Get Started
This client is written with Node.js. To run the client properly, prepare an environment with `node` and `npm` package are required.

### Prepare environment
To install `node` and `npm` package in system, refer to [Node.js](https://nodejs.org/en/download/).

### Install 3rd party libraries
Run commands as following to install 3rd party libraries.

```
npm install
```

### Create configuration file
Run commands as following to create a configuration file for connection.

```
npm run configure
```

Then, enter option value for each prompt:

```
prompt: Enter server address:  (ws://localhost:8080)
prompt: Enter player token:  12345678
prompt: Enter player number:  1
prompt: Enter player name:  Player1
prompt: Enter bot module name:  HeartsBotC0
prompt: (optional) Enter logs detination folder:  (logs)
```

## Run Client
Run commands as following to start a client instance.

```
npm start
```

## View Logs
As default, log files are exported at `/logs/*/detail.json` and `/logs/*/events.json`. Log files can be exported when:
- Game ended (event: game_end)
- Game stopped (event: game_stop)
- Disconnected from server. For example, game server is forced shutdown.

## Test Bots in Local

### Create configuration file
Run commands as following to create a configuration file for local game execution.
PS. A configuration file can be created manually without preparing environment.

```
npm run configure -- --mode local
```

Then, enter option value for each prompt:

```
prompt: (optional) Enter player name for player 1:  (Bot 1)
prompt: Enter bot module name for player 1:  HeartsBotC0
prompt: (optional) Enter player name for player 2:  (Bot 2)
prompt: Enter bot module name for player 2:  HeartsBotC0
prompt: (optional) Enter player name for player :  (Bot 3)
prompt: Enter bot module name for player 3:  HeartsBotC0
prompt: (optional) Enter player name for player 4:  (Bot 4)
prompt: Enter bot module name for player 4:  HeartsBotC0
prompt: (optional) Enter logs detination folder:  (logs)
```

### Run Game in Local
Run commands as following to execute a game in local.

```
npm run local
```

## Build & Deploy Client
**Make sure that you have created the configuration file before running the following commands**

Build an image

```
make build
```

Run a new container

```
make run name=<player-name> number=<player-number> token=<token> server=<server>
```

Create a tag with with `practice`

```
make tag-practice team=<team-number>
```

Create a tag with with `rank`

```
make tag-rank team=<team-number>
```

Log in to a Docker registry

```
make login
```

Push an image with `practice` to Docker registry

```
make push-practice team=<team-number>
```

Push an image with `rank` to Docker registry

```
make push-rank team=<team-number>
```

Clean untagged images

```
make clean
```

## Available Bots
Currently, there are 2 bots for the Trend Hearts. Configuration file must be configured with one bot for running the client agent. To generate configuration file please see **Create configuration file**.

### ScoreLessBot
ScoreLessBot is a rules-based bot, which is designed by Hanwen, and implemented by Austin. This bot will evaluate card scores for playing the cards for not winning scores.

### HeartsRiskEvaluateBot
HeartsRiskEvaluateBot is a rules-based bot, which is designed and implemented by Wilson, and reviewed with Austin. There are two strategies of the bot, which evaluates card risk for each round. First, it will try to play the safest card for not winning scores. And the second strategy tries to play the riskiest card for winning all score-cards (SHOOT THE MOON).

