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

## Run Game in Local
Run commands as following to execute a game in local.

```
npm run local
```
