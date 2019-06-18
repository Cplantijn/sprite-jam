import React from 'react';
import { Sprite } from 'react-konva';
import loadImages from '~helpers/loadImages';

export default class PlayerSprite extends React.PureComponent {
  spriteRef = React.createRef();
  state = { spritesLoaded: false };

  async componentDidMount() {
    await loadImages([`assets/images/${this.props.name}_idle.png`]);
    this.setState({ spritesLoaded: true }, () => {
      this.spriteRef.current.start();
    });
  }

  render() {
    if (!this.state.spritesLoaded) return null;
    const img = new Image();
    img.src = `assets/images/${this.props.name}_idle.png`;

    return (
      <Sprite
        ref={this.spriteRef}
        x={172}
        y={82}
        image={img}
        animation="standing"
        animations={{
          standing: [
            0, 0, 86, 164,
            86, 0, 86, 164,
            172, 0, 86, 164,
            258, 0, 86, 164
          ]
        }}
        frameRate={6}
        frameIndex={0}
      />
    )

  }
}