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