import React from 'react';
import sq from 'squeeze-js';
import { Stage, Layer } from 'react-konva';
import PlayerSelection from '~components/PlayerSelection';
import PlayerSprite from '~components/PlayerSprite';
import config from '~config';
import AngryBlockRow from '~components/AngryBlockRow';
import getRandomHolePositions from '~helpers/getRandomHolePositions';

export default class GameStage extends React.PureComponent {
  backgroundLayer = React.createRef();
  angryBlockRowRef = React.createRef();

  state = {
    height: window.innerHeight > config.MIN_SCREEN_HEIGHT - 1 ? window.innerHeight : config.MIN_SCREEN_HEIGHT,
    width: window.innerWidth > config.MIN_SCREEN_WIDTH - 1 ? window.innerWidth : config.MIN_SCREEN_WIDTH,
    angryHoles: []
  };

  componentDidMount() {
    this.drawBackground();
    window.addEventListener('resize', this.handleResize, false);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
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
    backgroundImage.src = 'assets/images/background.png';

    backgroundImage.addEventListener('load', () => {
      const canvasCtx = canvasRef.getContext('2d');
      canvasCtx.drawImage(backgroundImage, 0, 0, canvasRef.width, canvasRef.height);
    });
  }

  handleAngryBlocksReady = () => {
    this.setState({
      angryHoles: getRandomHolePositions(4)
    }, () => setTimeout(this.angryBlockRowRef.current.dropRow, 2000));
  }

  handleAngryBlocksSlammed = () => setTimeout(this.angryBlockRowRef.current.raiseRow, 1000);

  render() {
    const stageDimens = { height: this.state.height, width: this.state.width };

    return (
      <Stage height={this.state.height} width={this.state.width}>
        <Layer ref={this.backgroundLayer} />
        <Layer>
          <PlayerSelection stageDimens={stageDimens}/>
        </Layer>
        <Layer>
          <AngryBlockRow
            ref={this.angryBlockRowRef}
            holes={this.state.angryHoles}
            stageDimens={stageDimens}
            onReady={this.handleAngryBlocksReady}
            onSlammed={this.handleAngryBlocksSlammed}
          />
        </Layer>
        <Layer>
          <PlayerSprite name="ryu" />
        </Layer>
      </Stage>
    );
  }
}