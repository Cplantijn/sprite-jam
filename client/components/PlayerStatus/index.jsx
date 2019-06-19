import React from 'react';
import { Sprite } from 'react-konva';
import loadImages from '~helpers/loadImages';

export default class PlayerStatus extends React.PureComponent {
  state = { imagesLoaded: false };

  async componentDidMount() {
    await loadImages([`/assets/images/${this.props.name}_sprites.png`]);
    this.setState({ imagesLoaded: true });
  }

  render() {
    if (!this.state.imagesLoaded) return null;
    
    const img = new Image();
    img.src = `/assets/images/${this.props.name}_sprites.png`;

    return (
      <Sprite
        x={this.props.x + 102}
        y={this.props.y + 10}
        image={img}
        animation={this.props.active ? 'active' : 'disabled'}
        animations={{
          active: [0, 0, 86, 86],
          disabled: [86, 0, 86, 86]
        }}
        width={96}
        height={96}
      />
    )
  }
}