import React from 'react';
import { Sprite, Text, Rect, Image as KonvaImage } from 'react-konva';
import loadImages from '~helpers/loadImages';

export default class PlayerStatus extends React.PureComponent {
  state = { imagesLoaded: false };

  async componentDidMount() {
    await loadImages([
      `/assets/images/${this.props.name}_sprites.png`,
      '/assets/images/heart.png'
    ]);

    this.setState({ imagesLoaded: true });
  }

  drawBottomStatus = () => {
    if (!this.props.player) return null;

    if (!this.props.player.isReady) {
      return (
        <Text
          x={this.props.x + 102}
          y={this.props.y + 104}
          text="Not Ready"
          fill="black"
          fontSize={18}
        />
      );
    }
 
    const hearts = [];
    const heartImage = new Image();
    heartImage.src = '/assets/images/heart.png';

    for (var i = 0; i < this.props.player.lives; i++) {
      hearts.push(
        <KonvaImage
          key={i}
          y={this.props.y + 102}
          x={this.props.x + 102 + (28 * i)}
          width={22}
          height={22}
          image={heartImage}
        />
      )
    }

    return hearts;
  }

  render() {
    if (!this.state.imagesLoaded) return null;
    
    const img = new Image();
    img.src = `/assets/images/${this.props.name}_sprites.png`;

    return (
      <React.Fragment>
        {this.props.player && (
          <Rect
            x={this.props.x + 96}
            y={this.props.y + 5}
            width={100}
            height={100}
            fill="white"
            cornerRadius={6}
          />
        )}
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
        {this.props.player && (
          <Rect
            width={100}
            height={26}
            x={this.props.x + 96}
            y={this.props.y + 100}
            fill="#d3d3d3"
          />
        )}
        {this.drawBottomStatus()}
      </React.Fragment>
    )
  }
}