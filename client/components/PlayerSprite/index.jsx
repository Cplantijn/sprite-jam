import React from 'react';
import { Sprite } from 'react-konva';
import loadImages from '~helpers/loadImages';
import getSpriteGridPositions from '~helpers/getSpriteGridPositions';
import config from '~config';

export default class PlayerSprite extends React.PureComponent {
  spriteRef = React.createRef();
  state = { spritesLoaded: false };

  async componentDidMount() {
    await loadImages([`/assets/images/${this.props.name}_sprites.png`]);

    this.setState({ spritesLoaded: true }, () => {
      this.spriteRef.current.start();
    });
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const { stageDimens: { height: stageHeight }} = this.props;

    const img = new Image();
    img.src = `/assets/images/${this.props.name}_sprites.png`;

    return (
      <Sprite
        ref={this.spriteRef}
        x={0}
        y={(stageHeight * config.FLOOR_RATIO_FROM_TOP) - 215}
        scale={{
          x: 2.5,
          y: 2.5
        }}
        image={img}
        animation="strikingRight"
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
        frameRate={5}
      />
    )

    // return (
    //   <Sprite
    //     ref={this.spriteRef}
    //     x={172}
    //     y={82}
    //     image={img}
    //     animation="standing"
    //     animations={{
    //       standing: [
    //         0, 0, 86, 164,
    //         86, 0, 86, 164,
    //         172, 0, 86, 164,
    //         258, 0, 86, 164
    //       ]
    //     }}
    //     frameRate={6}
    //     frameIndex={0}
    //   />
    // )

  }
}