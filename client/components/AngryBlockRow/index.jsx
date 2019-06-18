import React from 'react';
import config from '~config';
import loadImages from '~helpers/loadImages';
import { config as springConfig } from 'react-spring'
import { Spring } from 'react-spring/renderprops'
import { animated } from 'react-spring/konva';

const WIDTH_TO_HEIGHT_RATIO = 1.3333333;
const FLOOR_RATIO_FROM_TOP = 0.7777777778;

const BLOCK_STATES = {
  RESTING: 'RESTING',
  FALLING: 'FALLING',
  RISING: 'RISING',
  READY: 'READY'
};

export default class AngryBlockRow extends React.PureComponent {
  state = { spritesLoaded: false, blocksState: BLOCK_STATES.RESTING };

  async componentDidMount() {
    await loadImages([
      'assets/images/block_angry.png',
      'assets/images/block_challenge.png',
      'assets/images/block_calm.png'
    ]);

    this.setState({ spritesLoaded: true }, this.props.onReady);
  }

  getImage = () => {
    switch (this.state.blocksState) {
      case BLOCK_STATES.RESTING:
        return 'assets/images/block_calm.png';
      case BLOCK_STATES.RISING:
        return 'assets/images/block_challenge.png';
      default:
        return 'assets/images/block_angry.png';
    }
  }
  
  dropRow = () => {
    this.setState({ blocksState: BLOCK_STATES.READY }, () => {
      setTimeout(() => {
        this.setState({ blocksState: BLOCK_STATES.FALLING });
      }, 200);
    })
  }

  raiseRow = () => { this.setState({ blocksState: BLOCK_STATES.RISING }) };

  handleRested = () => {
    const { blocksState } = this.state;

    if (blocksState === BLOCK_STATES.FALLING) {
      this.props.onSlammed();
    } else if (blocksState === BLOCK_STATES.RISING) {
      this.setState({ blocksState: BLOCK_STATES.RESTING }, this.props.onReady);
    }
    return;
  }

  getBlocksYPos = (blockHeight) => {
    switch(this.state.blocksState) {
      case BLOCK_STATES.FALLING:
        const { stageDimens: { height: stageHeight } } = this.props;
        return { y: (stageHeight * FLOOR_RATIO_FROM_TOP) - blockHeight};
      default:
        return { y: 0 }
    }
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { blocksState } = this.state;
    const widthPerBlock = this.props.stageDimens.width / config.ANGRY_BLOCK_COLUMNS;
    
    const img = new Image();
    img.src = this.getImage();

    return (
      <Spring
        config={{
          ...springConfig.wobbly,
          duration: blocksState === BLOCK_STATES.RISING ? 2000 : 500
        }}
        from={{ y: 0 }}
        to={this.getBlocksYPos(widthPerBlock * WIDTH_TO_HEIGHT_RATIO)}
        onRest={this.handleRested}
      >
        {animProps => {
          const blocks = [];
          for (let i = 0; i < config.ANGRY_BLOCK_COLUMNS; i++) {
            if (!this.props.holes.includes(i)) {
              blocks.push(
                <animated.Image
                  key={i}
                  {...animProps}
                  x={widthPerBlock * i}
                  image={img}
                  width={widthPerBlock}
                  height={widthPerBlock * WIDTH_TO_HEIGHT_RATIO}
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