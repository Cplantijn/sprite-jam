const WebSocket = require('ws');
const actions = require('../constants/actions');

const wss = new WebSocket.Server({ port: 8082 });

let gameHostSocket = null;
const sockets = {
  HOST: null,
  RYU: null,
  KEN: null,
  JOHN: null,
  BLANKA: null
};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const parsedMessage = JSON.parse(message);

    switch(parsedMessage.action) {
      case actions.CLAIM_GAME_HOST:
        console.log('Game Host is being claimed...');
        sockets.HOST = ws;
        break;
      case actions.PLAYER_READY:
        sockets[parsedMessage.playerName.toUpperCase()] = ws;

        sendToHost({
          action: actions.PLAYER_READY,
          playerName: parsedMessage.playerName
        });
        break;
      default:
        // Nada
    }
  });

  ws.on('close', function disconnect() {
    for (socketKey in sockets) {
      if (sockets[socketKey] === ws) {
        console.log(`${socketKey} disconnected`);
        sockets[socketKey] = null;

        if (socketKey !== 'HOST') {
          sendToHost({
            action: actions.PLAYER_LEAVE,
            playerName: socketKey.toLowerCase()
          });
        }
      }
    }
  })
});

function sendToHost(msg) {
  if (!sockets.HOST) {
    console.error('No gamehost connected. Nothing will happen.');
    return;
  }

  sockets.HOST.send(JSON.stringify(msg));
}