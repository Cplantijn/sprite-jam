const WebSocket = require('ws');
const actions = require('../constants/actions');

const wss = new WebSocket.Server({ port: 8082 });

const sockets = {
  HOST: null,
  RYU: null,
  KEN: null,
  JOHN: null,
  BLANKA: null
};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(msgEvent) {
    const msg = JSON.parse(msgEvent);

    switch(msg.action) {
      case actions.CLAIM_GAME_HOST:
        console.log('Game Host is being claimed...');
        sockets.HOST = ws;
        break;
      case actions.CHECK_PLAYER_AVAILABLE:
        ws.send(JSON.stringify({
          action: actions.SEND_PLAYER_AVAILABILITY,
          characterAvailable: !Boolean(sockets[msg.playerName.toUpperCase()])
        }))
      break;
      case actions.CLAIM_PLAYER:
        if (sockets[msg.playerName.toUpperCase()]) {
          ws.send(JSON.stringify({
            action: actions.SEND_PLAYER_AVAILABILITY,
            characterAvailable: false
          }));
        } else {
          sockets[msg.playerName.toUpperCase()] = ws;
          ws.send(JSON.stringify({ action: actions.PLAYER_CLAIMED }));
          sendToHost({
            action: actions.CLAIM_PLAYER,
            playerName: msg.playerName
          });
        }
        break;
      case actions.START_GAME:
        sendToPlayers({
          action: actions.START_GAME
        });
        break;
      case actions.CHECK_HOST:
        ws.send(JSON.stringify({
          action: actions.HOST_STATUS_REPORT,
          isActive: !!sockets.HOST
        }));
        break;
      case actions.PLAYER_READY:
        sendToHost({
          action: actions.PLAYER_READY,
          playerName: msg.playerName
        });
        break;
      case actions.ACK_PLAYER_READY:
        sendToPlayer(msg.playerName, {
          action: actions.ACK_PLAYER_READY
        });
        break;
      case actions.RESET_GAME:
        sendToPlayers({
          action: actions.RESET_GAME
        });
        break;
      case actions.PLAYER_KILLED:
        sendToPlayer(msg.playerName, {
          action: actions.PLAYER_KILLED
        });
        break;
      case actions.MOVE_LEFT:
      case actions.MOVE_RIGHT:
      case actions.BLINK_LEFT:
      case actions.BLINK_RIGHT:
      case actions.STOP:
      case actions.ATTACK:
        sendToHost({
          action: msg.action,
          playerName: msg.playerName
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
        } else {
          sendToPlayers({
            action: actions.HOST_STATUS_REPORT,
            isActive: false
          });

          setTimeout(clearAllSockets, 20);
        }
      }
    }
  })
});

function clearAllSockets() {
  sockets.HOST = null;
  sockets.RYU = null;
  sockets.KEN = null;
  sockets.JOHN = null;
  sockets.BLANKA = null;
}

function sendToHost(msg) {
  if (!sockets.HOST) {
    console.error('No gamehost connected. Nothing will happen.');
    return;
  }

  sockets.HOST.send(JSON.stringify(msg));
}

function sendToPlayers(msg) {
  for (const socket of Object.values(sockets)) {
    if (socket !== null) {
      socket.send(JSON.stringify(msg));
    }
  } 
}

function sendToPlayer(playerName, msg) {
  const playerKey = playerName.toUpperCase();
  
  if (!sockets[playerKey]) return;
  sockets[playerKey].send(JSON.stringify(msg));
}