import React from 'react';
import { Sprite } from 'react-konva';
import loadImages from '~helpers/loadImages';
import getSpriteGridPositions from '~helpers/getSpriteGridPositions';
import actions from '~constants/actions';
import config from '~config';

export default class PlayerSprite extends React.PureComponent {
  spriteRef = React.createRef();
  state = { spritesLoaded: false };

  async componentDidMount() {
    await loadImages([
      `/assets/images/${this.props.player.name}_sprites.png`,
      '/assets/images/boom.png',
      '/assets/images/blink.png'
    ]);

    this.setState({ spritesLoaded: true }, () => {
      this.spriteRef.current.start();
    });
  }

  getPlayerAnimationName = () => {
    const actionSuffix = this.props.player.moveState.facing === actions.FACING_LEFT ? 'Left' : 'Right';

    switch(this.props.player.moveState.action) {
      case actions.MOVE_LEFT:
      case actions.MOVE_RIGHT:
        return `walking${actionSuffix}`;
      case actions.STOP:
      case actions.BLINK_LEFT:
      case actions.BLINK_RIGHT:
        return `idleFacing${actionSuffix}`;
      case actions.ATTACK:
        return `striking${actionSuffix}`;
      case actions.RECEIVE_STRIKE:
        return `victimFacing${actionSuffix}`;
      default:
        return `idleFacing${actionSuffix}`;
    }
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { stageDimens: { height: stageHeight }} = this.props;

    const img = new Image();
    let animation, animations, frameRate, scaling, y, x;

    if ([actions.BLINK_LEFT, actions.BLINK_RIGHT].includes(this.props.player.moveState.action)) {
      img.src = '/assets/images/blink.png';
      animation = 'blink';
      animations = { blink: getSpriteGridPositions(0, 8)};
      frameRate = 40;
      scaling = config.PLAYER_SCALING * .75;
      x = this.props.player.moveState.position;
      y = (stageHeight * config.FLOOR_RATIO_FROM_TOP) - (86 * config.PLAYER_SCALING);
    } else if (this.props.player.exploding) {
      img.src = '/assets/images/boom.png';
      animation = 'blowup';

      const animationKeys = [0, 1, 2, 3, 4, 5, 6, 7].reduce((allPositions, currentRowIndex) => {
        const allSpritesInRow = getSpriteGridPositions(currentRowIndex, 8);
        allPositions = allPositions.concat(allSpritesInRow);
        return allPositions;
      }, []);

      animations = { blowup: animationKeys };
      frameRate = 20;
      scaling = config.PLAYER_SCALING * 2;
      x = this.props.player.moveState.position - (86 * 1.5) + 10;
      y = (stageHeight * config.FLOOR_RATIO_FROM_TOP) - (86 * config.PLAYER_SCALING * 1.5)
    } else {
      img.src = `/assets/images/${this.props.player.name}_sprites.png`;
      animation = this.getPlayerAnimationName();

      animations = {
        idleFacingRight: getSpriteGridPositions(1, 4),
        idleFacingLeft: getSpriteGridPositions(2, 4),
        walkingRight: getSpriteGridPositions(3, 5),
        walkingLeft: getSpriteGridPositions(4, 5),
        strikingRight: getSpriteGridPositions(5, 3),
        strikingLeft: getSpriteGridPositions(6, 3),
        victimFacingRight: getSpriteGridPositions(7, 3),
        victimFacingLeft: getSpriteGridPositions(8, 3),
        koFacingRight: getSpriteGridPositions(9, 5),
        koFacingLeft: getSpriteGridPositions(10, 5)
      };

      scaling = config.PLAYER_SCALING;
      x = this.props.player.moveState.position;
      y = (stageHeight * config.FLOOR_RATIO_FROM_TOP) - (86 * config.PLAYER_SCALING)
      frameRate = ['strikingRight', 'strikingLeft'].includes(animation) ? 12 : 8;
    }
    
    return (
      <Sprite
        ref={this.spriteRef}
        x={x}
        y={y}
        scale={{
          x: scaling,
          y: scaling
        }}
        image={img}
        animation={animation}
        animations={animations}
        frameRate={frameRate}
      />
    );
  }
}