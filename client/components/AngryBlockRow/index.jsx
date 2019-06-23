import React from 'react';
import config from '~config';
import loadImages from '~helpers/loadImages';
import { config as springConfig } from 'react-spring'
import { Spring } from 'react-spring/renderprops'
import { animated } from 'react-spring/konva';

const WIDTH_TO_HEIGHT_RATIO = 1.3333333;

const BLOCK_STATES = {
  CALM: 'CALM',
  ANGRY: 'ANGRY',
  FALLING: 'FALLING',
  RISING: 'RISING',
};

export default class AngryBlockRow extends React.PureComponent {
  springRef = React.createRef();
  floorYPosition = 0;
  widthPerBlock = 0;
  hitDetected = false;
  submittedHitDetection = false;
  submittedClearedOfPlayersPosition = false;
  state = { spritesLoaded: false, blocksState: BLOCK_STATES.CALM };

  async componentDidMount() {
    await loadImages(['/assets/images/angry_blocks.png']);
    this.widthPerBlock = this.props.stageDimens.width / config.ANGRY_BLOCK_COLUMNS;
    this.floorYPosition = (this.props.stageDimens.height * config.FLOOR_RATIO_FROM_TOP) - (this.widthPerBlock * WIDTH_TO_HEIGHT_RATIO);
    this.setState({ spritesLoaded: true }, this.props.onReady);
  }

  getCurrentBlockAnimation = () => {
    switch (this.state.blocksState) {
      case BLOCK_STATES.CALM:
        return 'calm';
      case BLOCK_STATES.RISING:
        return 'flustered';
      default:
        return 'angry';
    }
  }
  
  dropRow = () => {
    this.setState({ blocksState: BLOCK_STATES.ANGRY }, () => {
      setTimeout(() => {
        this.setState({ blocksState: BLOCK_STATES.FALLING });
      }, 1000);
    })
  }

  raiseRow = () => { this.setState({ blocksState: BLOCK_STATES.RISING }) };

  handleRested = ({ y }) => {
    const { blocksState } = this.state;

    if (blocksState === BLOCK_STATES.FALLING && y === this.floorYPosition && !this.hitDetected) {
      this.props.onSlammed();
    } else if (blocksState === BLOCK_STATES.RISING) {
      this.setState({ blocksState: BLOCK_STATES.CALM }, this.props.onReady);
    }
    return;
  }

  getBlocksYPos = () => {
    switch(this.state.blocksState) {
      case BLOCK_STATES.FALLING:
        const { stageDimens: { height: stageHeight } } = this.props;
        return { y: this.floorYPosition };
      default:
        return { y: 0 }
    }
  }

  handleOnFrame = ({y}) => {
    const hitPlayersThreshold = this.floorYPosition - (86 * config.PLAYER_SCALING) + 10;

    if (y > hitPlayersThreshold && !this.submittedHitDetection) {
      this.props.onHitTreshold();
    } else if (this.state.blocksState === BLOCK_STATES.RISING && !this.submittedClearedOfPlayersPosition && y < hitPlayersThreshold) {
      this.props.onPlayerClearThreshold();
    }
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { blocksState } = this.state;
    
    const img = new Image();
    img.src = '/assets/images/angry_blocks.png';
    const scale = this.widthPerBlock / 72;

    return (
      <Spring
        ref={this.springRef}
        config={{
          ...springConfig.wobbly,
          duration: blocksState === BLOCK_STATES.RISING ? 2000 : 300
        }}
        from={{ y: 0 }}
        to={this.getBlocksYPos()}
        onRest={this.handleRested}
        onFrame={this.handleOnFrame}
      >
        {animProps => {
          const blocks = [];

          for (let i = 0; i < config.ANGRY_BLOCK_COLUMNS; i++) {
            if (!this.props.holes.includes(i)) {
              blocks.push(
                <animated.Sprite
                  key={i}
                  scale={{
                    x: scale,
                    y: scale
                  }}
                  {...animProps}
                  x={this.widthPerBlock * i}
                  image={img}
                  animation={this.getCurrentBlockAnimation()}
                  animations={{
                    calm: [0, 0, 72, 96],
                    flustered: [72, 0, 72, 96],
                    angry: [144, 0, 72, 96]
                  }}
                />
              );
            }
          }

          return blocks;
        }}
      </Spring>
    );
  }
}