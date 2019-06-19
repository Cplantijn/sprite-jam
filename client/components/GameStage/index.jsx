import React from 'react';
import sq from 'squeeze-js';
import { Stage, Layer } from 'react-konva';
import PlayersRow from '~components/PlayersRow';
import PlayerSprite from '~components/PlayerSprite';
import config from '~config';
import actions from '~constants/actions';
import AngryBlockRow from '~components/AngryBlockRow';
import getRandomHolePositions from '~helpers/getRandomHolePositions';

export default class GameStage extends React.PureComponent {
  socket = new WebSocket(config.WS_ADDRESS);
  backgroundLayer = React.createRef();
  angryBlockRowRef = React.createRef();

  state = {
    height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
    width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH,
    blockHoles: [],
    players: [],
    gameIsActive: false
  };

  componentDidMount() {
    this.drawBackground();
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

  handleWsMessage = (msgEvent) => {
    const msg = JSON.parse(msgEvent.data);

    switch(msg.action) {
      case actions.PLAYER_READY:
        this.setState(prevState => {
          if (!prevState.players.find(player => player.name === msg.playerName)) {
            return {
              ...prevState,
              players: prevState.players.concat([{
                name: msg.playerName
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
      default:
        // NADA
    }
  }

  handleResize = () => {
    this.setState({
      height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
      width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH
    }, () => {
      this.drawBackground();
    })
  }

  drawBackground = () => {
    const canvasRef = sq(this.backgroundLayer, _ => _.current.canvas);
    if (!canvasRef) return;

    const backgroundImage = new Image();
    backgroundImage.src = '/assets/images/background.png';

    backgroundImage.addEventListener('load', () => {
      const canvasCtx = canvasRef.getContext('2d');
      canvasCtx.drawImage(backgroundImage, 0, 0, canvasRef.width, canvasRef.height);
    });
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
        setTimeout(this.angryBlockRowRef.current.dropRow, 2000)
      }
    });
  }

  handleAngryBlocksSlammed = () => setTimeout(this.angryBlockRowRef.current.raiseRow, 1000);

  renderPlayerSprites = () => {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return this.state.players.map(player => (
      <PlayerSprite
        key={player.name}
        name={player.name}
        stageDimens={stageDimens}
      />
    ));
  }

  render() {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return (
      <Stage height={this.state.height} width={this.state.width}>
        <Layer ref={this.backgroundLayer} />
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
          />
        </Layer>
        <Layer>
          {this.renderPlayerSprites()}
        </Layer>
      </Stage>
    );
  }
}