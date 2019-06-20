import React from 'react';
import { Stage, Layer } from 'react-konva';
import PlayersRow from '~components/PlayersRow';
import PlayerSprite from '~components/PlayerSprite';
import config from '~config';
import actions from '~constants/actions';
import AngryBlockRow from '~components/AngryBlockRow';
import StageBackground from '~components/StageBackground';
import getRandomHolePositions from '~helpers/getRandomHolePositions';
import getSafeBands from '~helpers/getSafeBands';
import getPlayerPerceivedBounds from '~helpers/getPlayerPerceivedBounds';

export default class GameStage extends React.PureComponent {
  socket = new WebSocket(config.WS_ADDRESS);
  angryBlockRowRef = React.createRef();
  moveIntervals = {};

  state = {
    height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
    width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH,
    blockHoles: [],
    players: [],
    gameIsActive: false
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
    this.socket.addEventListener('message', this.handleWsMessage);
    this.socket.addEventListener('open', () => {
      this.socket.send(JSON.stringify({
        action: actions.CLAIM_GAME_HOST
      }));
    });
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
    this.socket.removeEventListener('message', this.handleWsMessage);
    this.socket.removeEventListener('open', this.handleWsMessage);
  }

  checkShouldStartGame = () => {
    this.setState(prevState => {
      const allPlayersReady = prevState.players.every(player => player.isReady);

      if (!allPlayersReady) return prevState;
      return {
        ...prevState,
        gameIsActive: true
      }
    }, () => {
      if (this.state.gameIsActive) {
        this.socket.send(JSON.stringify({
          action: actions.START_GAME
        }));

        this.handleAngryBlocksReady();
      }
    });
  }

  calculateNextPosition = (position, direction) => {
      const nextPosition = position + (6 * (direction === 'LEFT' ? -1 : 1 ));
      const { start: nextPerceivedStart, end: nextPerceivedEnd } = getPlayerPerceivedBounds(nextPosition);
      const { start: startBounds } = getPlayerPerceivedBounds(0);
      const { end: endBounds } = getPlayerPerceivedBounds(this.state.width);
      
      if (direction === 'LEFT') {
        const adjustedStartBounds = startBounds * -1;
        return nextPosition > adjustedStartBounds ? nextPosition : position;
      }
      
      return nextPerceivedEnd < this.state.width ? nextPosition : position;
  }

  moveCharacter = (name, direction) => {
    return setInterval(() => {
      this.setState(prevState => {
        return {
          ...prevState,
          players: prevState.players.map(player => {
            if (player.name === name) {
              return {
                ...player,
                moveState: {
                  ...player.moveState,
                  position: this.calculateNextPosition(player.moveState.position, direction)
                }
              }
            }

            return player;
          })
        }
      });
    }, 16);
  }

  handleWsMessage = (msgEvent) => {
    const msg = JSON.parse(msgEvent.data);

    switch(msg.action) {
      case actions.PLAYER_READY:
        this.setState(prevState => ({
          ...prevState,
          players: prevState.players.map(player => {
            if (player.name === msg.playerName) {
              return {
                ...player,
                isReady: true
              }
            }
            return player;
          })
        }), this.checkShouldStartGame);
        break;
      case actions.CLAIM_PLAYER:
        this.setState(prevState => {
          if (!prevState.gameIsActive && !prevState.players.find(player => player.name === msg.playerName)) {
            return {
              ...prevState,
              players: prevState.players.concat([{
                name: msg.playerName,
                isReady: false,
                moveState: {
                  facing: actions.FACING_RIGHT,
                  action: actions.STOP,
                  position: (Math.random() * ((this.state.width * .8 - this.state.width * .2) + 1)) + this.state.width * .2,
                }
              }])
            }
          }

          return prevState;
        });
        break;
      case actions.PLAYER_LEAVE:
        this.setState(prevState => ({
          ...prevState,
          players: prevState.players.filter(p => p.name !== msg.playerName)
        }));
        break;
      case actions.MOVE_LEFT:
      case actions.MOVE_RIGHT:
      case actions.STOP:
      case actions.ATTACK:
        this.setState(prevState => ({
          ...prevState,
          players: prevState.players.map(player => {
            if (player.name === msg.playerName) {
              clearInterval(this.moveIntervals[player.name]);
              let facing = player.moveState.facing;

              if (actions.MOVE_LEFT === msg.action) {
                facing = actions.FACING_LEFT;
                this.moveIntervals[player.name] = this.moveCharacter(player.name, 'LEFT');
              } else if (actions.MOVE_RIGHT === msg.action) {
                facing = actions.FACING_RIGHT;
                this.moveIntervals[player.name] = this.moveCharacter(player.name, 'RIGHT');
              }

              return {
                ...player,
                moveState: {
                  ...player.moveState,
                  facing,
                  action: msg.action,
                }
              }
            }

            return player;
        })
        }));
      default:
        // NADA
    }
  }

Resize = () => {
    this.setState({
      height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
      width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH
  })
  }

  handleAngryBlocksReady = () => {
    this.setState(prevState => {
      if (prevState.gameIsActive) {
        return {
          ...prevState,
          blockHoles: getRandomHolePositions(4)
        }
      }

      return prevState;
    }, () => {
      if (this.state.gameIsActive) {
        this.angryBlockRowRef.current.submittedHitDetection = false;
        setTimeout(this.angryBlockRowRef.current.dropRow, 2000);
      }
    });
  }

  onAngryBlocksRequestCollisionCheck = (widthPerBlock) => {
    this.angryBlockRowRef.current.submittedHitDetection = true;
    const safeXBands = getSafeBands(this.state.blockHoles, widthPerBlock);

    const hitPlayers = this.state.players.filter(player => {
      return !safeXBands.some(band => {
        const { start: playerStart, end: playerEnd } = getPlayerPerceivedBounds(player.moveState.position);
        console.log({ playerStart, playerEnd, band });
        return band.start <= playerStart && band.end >= playerEnd;
      });
    });

    if (hitPlayers.length) {
      this.angryBlockRowRef.current.hitDetected = true;
      this.angryBlockRowRef.current.springRef.current.stop();
    }
  }

  handleAngryBlocksSlammed = () => {
    setTimeout(this.angryBlockRowRef.current.raiseRow, 1000);
  }

  renderPlayerSprites = () => {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return this.state.players.map(player => (
      <PlayerSprite
        key={player.name}
        player={player}
        stageDimens={stageDimens}
      />
    ));
  }

  render() {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return (
      <Stage height={this.state.height} width={this.state.width}>
        <Layer>
          <StageBackground  stageDimens={stageDimens} />
        </Layer>
        <Layer>
          <PlayersRow
            stageDimens={stageDimens}
            activePlayers={this.state.players}
          />
        </Layer>
        <Layer>
          <AngryBlockRow
            ref={this.angryBlockRowRef}
            holes={this.state.blockHoles}
            stageDimens={stageDimens}
            onReady={this.handleAngryBlocksReady}
            onSlammed={this.handleAngryBlocksSlammed}
            onHitTreshold={this.onAngryBlocksRequestCollisionCheck}
          />
        </Layer>
        <Layer>
          {this.renderPlayerSprites()}
        </Layer>
      </Stage>
    );
  }
}