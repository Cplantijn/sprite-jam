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
  state = { spritesLoaded: false, blocksState: BLOCK_STATES.CALM };

  async componentDidMount() {
    await loadImages(['/assets/images/angry_blocks.png']);
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
      }, 1500);
    })
  }

  raiseRow = () => { this.setState({ blocksState: BLOCK_STATES.RISING }) };

  handleRested = () => {
    const { blocksState } = this.state;

    if (blocksState === BLOCK_STATES.FALLING) {
      this.props.onSlammed();
    } else if (blocksState === BLOCK_STATES.RISING) {
      this.setState({ blocksState: BLOCK_STATES.CALM }, this.props.onReady);
    }
    return;
  }

  getBlocksYPos = (blockHeight) => {
    switch(this.state.blocksState) {
      case BLOCK_STATES.FALLING:
        const { stageDimens: { height: stageHeight } } = this.props;
        return { y: (stageHeight * config.FLOOR_RATIO_FROM_TOP) - blockHeight};
      default:
        return { y: 0 }
    }
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { blocksState } = this.state;
    const widthPerBlock = this.props.stageDimens.width / config.ANGRY_BLOCK_COLUMNS;
    
    const img = new Image(widthPerBlock, (widthPerBlock * WIDTH_TO_HEIGHT_RATIO) * 3);
    img.src = '/assets/images/angry_blocks.png';
    const scale =  widthPerBlock / 72;

    return (
      <Spring
        config={{
          ...springConfig.wobbly,
          duration: blocksState === BLOCK_STATES.RISING ? 2000 : 300
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
                <animated.Sprite
                  key={i}
                  scale={{
                    x: scale,
                    y: scale
                  }}
                  {...animProps}
                  x={widthPerBlock * i}
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