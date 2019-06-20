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
    await loadImages([`/assets/images/${this.props.player.name}_sprites.png`]);

    this.setState({ spritesLoaded: true }, () => {
      this.spriteRef.current.start();
    });
  }

  getAnimationName = () => {
    const actionSuffix = this.props.player.moveState.facing === actions.FACING_LEFT ? 'Left' : 'Right';

    switch(this.props.player.moveState.action) {
      case actions.MOVE_LEFT:
      case actions.MOVE_RIGHT:
        return `walking${actionSuffix}`;
      case actions.STOP:
        return `idleFacing${actionSuffix}`;
      case actions.ATTACK:
        return `striking${actionSuffix}`;
      default:
        return 'victimFacingLeft';
    }
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { stageDimens: { height: stageHeight }} = this.props;

    const img = new Image();
    img.src = `/assets/images/${this.props.player.name}_sprites.png`;

    return (
      <Sprite
        ref={this.spriteRef}
        x={this.props.player.moveState.position}
        y={(stageHeight * config.FLOOR_RATIO_FROM_TOP) - (86 * config.PLAYER_SCALING)}
        scale={{
          x: config.PLAYER_SCALING,
          y: config.PLAYER_SCALING
        }}
        image={img}
        animation={this.getAnimationName()}
        animations={{
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
        }}
        frameRate={8}
      />
    );
  }
}