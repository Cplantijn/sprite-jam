import React from 'react';
import { Sprite, Text, Rect } from 'react-konva';
import loadImages from '~helpers/loadImages';

export default class PlayerStatus extends React.PureComponent {
  state = { imagesLoaded: false };

  async componentDidMount() {
    await loadImages([`/assets/images/${this.props.name}_sprites.png`]);
    this.setState({ imagesLoaded: true });
  }

  drawReadyState = () => {
    if (!this.props.player || this.props.player.isReady) return null;
    return (
      <React.Fragment>
        <Rect
          width={100}
          height={26}
          x={this.props.x + 96}
          y={this.props.y + 100}
          cornerRadius={4}
          fill="red"
        />
        <Text
          x={this.props.x + 102}
          y={this.props.y + 104}
          text="Not Ready"
          fill="white"
          fontSize={18}
        />
      </React.Fragment>
    )
  }

  render() {
    if (!this.state.imagesLoaded) return null;
    
    const img = new Image();
    img.src = `/assets/images/${this.props.name}_sprites.png`;

    return (
      <React.Fragment>
        <Sprite
          x={this.props.x + 102}
          y={this.props.y + 10}
          image={img}
          animation={this.props.player ? 'active' : 'disabled'}
          animations={{
            active: [0, 0, 86, 86],
            disabled: [86, 0, 86, 86]
          }}
          width={96}
          height={96}
        />
        {this.drawReadyState()}
      </React.Fragment>
    )
  }
}