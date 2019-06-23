import React from 'react';
import { Stage, Layer } from 'react-konva';
import PlayersRow from '~components/PlayersRow';
import PlayerSprite from '~components/PlayerSprite';
import config from '~config';
import actions from '~constants/actions';
import AngryBlockRow from '~components/AngryBlockRow';
import StageBackground from '~components/StageBackground';
import getRandomHolePositions from '~helpers/getRandomHolePositions';
import { getBlockAngryBlockSafeBands } from '~helpers/getSafeBands';
import getPlayerPerceivedBounds from '~helpers/getPlayerPerceivedBounds';
import './GameStage.scss';

export default class GameStage extends React.PureComponent {
  socket = new WebSocket(config.WS_ADDRESS);
  angryBlockRowRef = React.createRef();
  victimTimeouts = {};
  moveIntervals = {};

  state = {
    height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
    width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH,
    blockHoles: [],
    players: [],
    gameIsActive: false,
    angryBlocksImpedeMovement: false,
    winningPlayer: null
  };

  componentDidMount() {
    window.addEventListener('resize', this.handle, false);
    this.socket.addEventListener('message', this.handleWsMessage);
    this.socket.addEventListener('open', () => {
      this.sendWsMessage({
        action: actions.CLAIM_GAME_HOST
      });
    });
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
    this.socket.removeEventListener('message', this.handleWsMessage);
    this.socket.removeEventListener('open', this.handleWsMessage);
  }

  checkShouldStartGame = () => {
    this.setState(prevState => {
      const readyPlayers = prevState.players.filter(player => player.isReady);

      if (readyPlayers.length < 2) return prevState;
    
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

  resetGameState = () => {
    this.setState(prevState => ({
      blockHoles: [],
      gameIsActive: false,
      winningPlayer: null,
      angryBlocksImpedeMovement: false,
      players: prevState.players.map(player => ({
        ...player,
        isReady: false,
        canBlink: true,
        movementAllowed: true,
        lives: config.STARTING_LIVES,
        exploding: false,
        moveState: {
          facing: actions.FACING_RIGHT,
          action: actions.STOP,
          position: this.getPlayerStartPosition(player.name)
        }
      }))
    }), () => {
        this.sendWsMessage({ action: actions.RESET_GAME })
    })
  }

  getNearestPlayers = (players, playerName) => {
    const sortedPlayers = players.slice();
    sortedPlayers.sort((a, b) => a.moveState.position > b.moveState.position ? 1 : -1);
    const indexOfPlayer = sortedPlayers.findIndex(p => p.name === playerName);

    return {
      left: sortedPlayers[indexOfPlayer - 1],
      right: sortedPlayers[indexOfPlayer + 1]
    }
  }

  throwVictim = (victim, direction) => {
    this.moveIntervals[victim.name] = this.moveCharacter(victim.name, direction, config.VICTIM_THROW_DISTANCE / 16);
    
    setTimeout(() => {
      clearInterval(this.moveIntervals[victim.name]);
    }, config.VICTIM_STUN_DURATION);
  }

  calculateNextPosition = (playerName, position, direction, distance) => {
    const nextPosition = position + (distance * (direction === 'LEFT' ? -1 : 1 ));
    const { start: nextPerceivedStart, end: nextPerceivedEnd } = getPlayerPerceivedBounds(nextPosition);
    const { start: startBounds } = getPlayerPerceivedBounds(0);
    const { end: endBounds } = getPlayerPerceivedBounds(this.state.width);

    if (this.state.angryBlocksImpedeMovement) {
      const widthPerBlock = this.state.width / config.ANGRY_BLOCK_COLUMNS;
      const safeXBands = getBlockAngryBlockSafeBands(this.state.blockHoles, widthPerBlock);
      const canMove = safeXBands.some(band => band.start <= nextPerceivedStart && band.end >= nextPerceivedEnd);

      if (!canMove) return position;
    }

    const {
      left: nearestLeftPlayer,
      right: nearestRightPlayer
    } = this.getNearestPlayers(this.state.players, playerName);

    if (direction === 'LEFT') {
      if (nearestLeftPlayer) {
        const { end: opponentEnd, start: opponentStart } = getPlayerPerceivedBounds(nearestLeftPlayer.moveState.position);
        if (opponentEnd >= nextPerceivedStart && opponentStart <= nextPerceivedEnd) return position;
      }

      const adjustedStartBounds = startBounds * -1;
      return nextPosition > adjustedStartBounds ? nextPosition : position;
    }
    
    if (nearestRightPlayer) {
      const { end: opponentEnd, start: opponentStart } = getPlayerPerceivedBounds(nearestRightPlayer.moveState.position);
      if (nextPerceivedEnd >= opponentStart && nextPerceivedStart <= opponentEnd) return position;
    }

    return nextPerceivedEnd < this.state.width ? nextPosition : position;
  }

  moveCharacter = (name, direction, distance = 6) => {
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
                  position: this.calculateNextPosition(player.name, player.moveState.position, direction, distance)
                }
              }
            }

            return player;
          })
        }
      });
    }, 16);
  }

  getPlayerStartPosition = (playerName) => {
    const rosterPosition = config.PLAYERS.findIndex(p => p.name === playerName);

    if (rosterPosition > -1) {
      const nextPositionCandidate = (rosterPosition + 1) * 320;
      return nextPositionCandidate < this.state.width ? nextPositionCandidate : this.state.width - 200;
    }

    return Math.random() * (this.state.width * .8 - this.state.width * .2) + (this.state.width * .2); 
  }

  sendWsMessage = msg => this.socket.send(JSON.stringify(msg));

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
        }), () => {
          this.sendWsMessage({
            action: actions.ACK_PLAYER_READY,
            playerName: msg.playerName
          });

          this.checkShouldStartGame();
        });
        break;
      case actions.CLAIM_PLAYER:
        this.setState(prevState => {
          if (!prevState.gameIsActive && !prevState.players.find(player => player.name === msg.playerName)) {
            return {
              ...prevState,
              players: prevState.players.concat([{
                name: msg.playerName,
                isReady: false,
                canBlink: true,
                movementAllowed: true,
                lives: config.STARTING_LIVES,
                exploding: false,
                moveState: {
                  facing: actions.FACING_RIGHT,
                  action: actions.STOP,
                  position: this.getPlayerStartPosition(msg.playerName)
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
      case actions.ATTACK:
        let victimPlayer = null;
        
        this.setState(prevState => {
          const actingPlayer = prevState.players.find(p => p.name === msg.playerName);
          const nearestPlayers = this.getNearestPlayers(prevState.players, actingPlayer.name);
          const actingPlayerBounds = getPlayerPerceivedBounds(actingPlayer.moveState.position);
          let direction = null;

          if (actingPlayer.moveState.facing === actions.FACING_RIGHT && nearestPlayers.right) {
            // Find in Range
            const nearestRightPlayerBounds = getPlayerPerceivedBounds(nearestPlayers.right.moveState.position);

            if (actingPlayerBounds.end + ((86 / 3) * config.PLAYER_SCALING) >= nearestRightPlayerBounds.start) {
              victimPlayer = nearestPlayers.right;
              direction = 'RIGHT';
            }
          } else if (actingPlayer.moveState.facing === actions.FACING_LEFT && nearestPlayers.left) {
            const nearestLeftPlayerBounds = getPlayerPerceivedBounds(nearestPlayers.left.moveState.position);

            if (actingPlayerBounds.start - ((86 / 3) * config.PLAYER_SCALING) <= nearestLeftPlayerBounds.end) {
              victimPlayer = nearestPlayers.left;
              direction = 'LEFT';
            }
          }

          if (victimPlayer) {
            clearInterval(this.moveIntervals[victimPlayer.name]);
            clearTimeout(this.victimTimeouts[victimPlayer.name]);
            this.throwVictim(victimPlayer, direction);
          }

          return {
            ...prevState,
            players: prevState.players.map(player => {
              if (player.name === msg.playerName) {
                return {
                  ...player,
                  moveState: {
                    ...player.moveState,
                    action: msg.action
                  }
                }
              } else if (victimPlayer && player.name === victimPlayer.name) {
                return {
                  ...player,
                  movementAllowed: false,
                  moveState: {
                    ...player.moveState,
                    action: actions.RECEIVE_STRIKE
                  }
                }
              }

              return player;
            })
          }
        }, () => {
          if (victimPlayer) {
              this.victimTimeouts[victimPlayer.name] = setTimeout(() => {
                this.setState(prevState => ({
                  ...prevState,
                  players: prevState.players.map(player => {
                    if (player.name === victimPlayer.name) {
                      return {
                        ...player,
                        movementAllowed: true,
                        moveState: {
                          ...player.moveState,
                          action: actions.STOP
                        }
                      }
                    }

                    return player;
                  })
                })
              )}, config.VICTIM_STUN_DURATION);
          }
        })
        break;
      case actions.MOVE_LEFT:
      case actions.MOVE_RIGHT:
      case actions.STOP:
      case actions.BLINK_LEFT:
      case actions.BLINK_RIGHT:
        this.setState(prevState => ({
          ...prevState,
          players: prevState.players.map(player => {
            if (player.name === msg.playerName && player.movementAllowed) {
              clearInterval(this.moveIntervals[msg.playerName]);

              let facing = player.moveState.facing;
              const playerWasBlinking = [actions.BLINK_LEFT, actions.BLINK_RIGHT].includes(player.moveState.action);

              if ([actions.MOVE_LEFT, actions.MOVE_RIGHT].includes(msg.action) && !playerWasBlinking) {
                const direction = (msg.action === actions.MOVE_LEFT) ? 'LEFT' : 'RIGHT';
                facing = (msg.action === actions.MOVE_LEFT) ? actions.FACING_LEFT : actions.FACING_RIGHT;
                this.moveIntervals[player.name] = this.moveCharacter(player.name, direction, 6);
              } else if ([actions.BLINK_LEFT, actions.BLINK_RIGHT].includes(msg.action) && player.canBlink) {
                const direction = (msg.action === actions.BLINK_LEFT) ? 'LEFT' : 'RIGHT';
                const nextPosition = this.calculateNextPosition(player.name, player.moveState.position, direction, config.BLINK_DISTANCE);

                return {
                  ...player,
                  moveState: {
                    ...player.moveState,
                    action: nextPosition !== player.moveState.position ? msg.action : player.moveState.action,
                    facing
                  }
                }
              }

              let nextAction = msg.action;

              if (playerWasBlinking && msg.action === actions.STOP) {
                nextAction = player.moveState.action;
              } else if ([actions.BLINK_LEFT, actions.BLINK_RIGHT].includes(msg.action) && !player.canBlink) {
                nextAction = player.moveState.action;
              }

              return {
                ...player,
                moveState: {
                  ...player.moveState,
                  facing,
                  action: nextAction
                }
              }
            }

            return player;
        })
        }), () => {
          const actingPlayer = this.state.players.find(p => p.name === msg.playerName);

          if ([actions.BLINK_LEFT, actions.BLINK_RIGHT].includes(msg.action) && actingPlayer && actingPlayer.canBlink) {
            setTimeout(() => {
              this.setState(prevState => ({
                ...prevState,
                players: prevState.players.map(player => {
                  if (player.name === msg.playerName && player.canBlink) {
                    const direction = (msg.action === actions.BLINK_LEFT) ? 'LEFT' : 'RIGHT';
                    const facing = (msg.action === actions.BLINK_LEFT) ? actions.FACING_LEFT : actions.FACING_RIGHT;
                    const nextPosition = this.calculateNextPosition(player.name, player.moveState.position, direction, config.BLINK_DISTANCE);

                    if (nextPosition !== player.moveState.position) {
                      return {
                        ...player,
                        canBlink: false,
                        moveState: {
                          ...player.moveState,
                          facing,
                          position: nextPosition,
                          action: msg.action
                        }
                      }
                    }
                  }

                  return player;
                })
              }), () => {
                setTimeout(() => {
                  this.setState(prevState => ({
                    ...prevState,
                    players: prevState.players.map(player => {
                      if (player.name === msg.playerName) {
                        return {
                          ...player,
                          moveState: {
                            ...player.moveState,
                            action: actions.STOP
                          }
                        }
                      }

                      return player;
                    })
                  }))
                }, 120);

                setTimeout(() => {
                  this.setState(prevState => ({
                    ...prevState,
                    players: prevState.players.map(player => {
                      if (player.name === msg.playerName) {
                        return {
                          ...player,
                          canBlink: true
                        }
                      }
                      return player;
                    })
                  }))
                }, config.BLINK_COOLDOWN)
              })
            }, 120)
          }
        });
      default:
        // NADA
    }
  }

  handleResize = () => {
    this.setState({
      height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
      width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH
    })
  }

  handleAngryBlocksReady = () => {
    this.angryBlockRowRef.current.submittedClearedOfPlayersPosition = false;

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
        const dropTime = Math.floor(Math.random() * (config.MAX_BLOCK_DROP_TIME - config.MIN_BLOCK_DROP_TIME + 1)) + config.MIN_BLOCK_DROP_TIME;
        setTimeout(this.angryBlockRowRef.current.dropRow, dropTime);
      }
    });
  }

  onAngryBlocksClearOfPlayersThreshold = () => {
    this.angryBlockRowRef.current.submittedClearedOfPlayersPosition = true;

    this.setState({
      angryBlocksImpedeMovement: false
    });
  }

  onAngryBlocksRequestCollisionCheck = () => {
    const widthPerBlock = this.state.width / config.ANGRY_BLOCK_COLUMNS;

    this.angryBlockRowRef.current.submittedHitDetection = true;
    this.setState({
      angryBlocksImpedeMovement: true
    }, () => {
      const safeXBands = getBlockAngryBlockSafeBands(this.state.blockHoles, widthPerBlock);

      const hitPlayerNames = this.state.players.filter(player => {
        return !safeXBands.some(band => {
          const { start: playerStart, end: playerEnd } = getPlayerPerceivedBounds(player.moveState.position);
          return band.start <= playerStart && band.end >= playerEnd;
        });
      }).map(p => p.name);

      if (hitPlayerNames.length) {
        this.angryBlockRowRef.current.hitDetected = true;

        this.setState(prevState => ({
          ...prevState,
          players: prevState.players.map(player => {
            if (hitPlayerNames.includes(player.name)) {
              clearInterval(this.moveIntervals[player.name]);

              return {
                ...player,
                movementAllowed: false,
                lives: player.lives - 1,
                exploding: true
              };
            }
            return player;
          })
        }), () => {
          // Give time for explosion animation
          setTimeout(() => {
            this.setState(prevState => ({
              ...prevState,
              players: prevState.players.map(player => ({
                ...player,
                movementAllowed: true,
                exploding: false
              }))
            }), () => {
              this.moveDeadCharactersOffscreen();
            })
          }, 3000);
          this.handleAngryBlocksSlammed();
        })
      }
    });
  }
  
  checkWinCondition = () => {
    const alivePlayers = this.state.players.filter(p => p.lives > 0);

    if (alivePlayers.length === 1) {
      this.setState(prevState => ({
        gameIsActive: false,
        winningPlayer: `${alivePlayers[0].name.substring(0, 1).toUpperCase()}${alivePlayers[0].name.substring(1)}`,
        players: prevState.players.map(player => ({
          ...player,
          canMove: false,
          canBlink: false
        }))
      }), () => {
        setTimeout(this.resetGameState, 5000);
      })
    }
  }

  moveDeadCharactersOffscreen = () => {
    this.setState(prevState => ({
      ...prevState,
      players: prevState.players.map(player => {
        if (player.lives === 0) {
          return {
            ...player,
            movementAllowed: false,
            moveState: {
              ...player.moveState,
              position: prevState.width * 3
            }
          }
        }

        return player;
      })
    }), this.checkWinCondition);
  }

  handleAngryBlocksSlammed = () => {
    this.angryBlockRowRef.current.hitDetected = false;
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
  
  renderBroadCastMessage = () => {
    if (this.state.winningPlayer === null) return null;
    if (this.state.winningPlayer) {
      return (
        <div className="broadcast-message-container">
          <h1>{this.state.winningPlayer} wins!</h1>
        </div>
      );
    }

  }

  render() {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return (
      <React.Fragment>
        {this.renderBroadCastMessage()}
        <Stage height={this.state.height} width={this.state.width}>
          <Layer>
            <StageBackground stageDimens={stageDimens} />
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
              onPlayerClearThreshold={this.onAngryBlocksClearOfPlayersThreshold}
            />
          </Layer>
          <Layer>
            {this.renderPlayerSprites()}
          </Layer>
        </Stage>
      </React.Fragment>
    );
  }
}