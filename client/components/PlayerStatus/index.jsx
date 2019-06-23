import React from 'react';
import { Sprite, Text, Rect, Image as KonvaImage } from 'react-konva';
import loadImages from '~helpers/loadImages';
import config from '~config';

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
    if (!this.props.player) {
      return(
        <Text
          key="join-prompt"
          x={this.props.x + 28}
          y={this.props.y + 105}
          text={`Play @ ${config.WS_ADDRESS.replace('ws:', 'http:').replace('8082', '8080')}/${this.props.name}`}
          fill="white"
          fontSize={16}
        />
      )
    }

    const statuses = [];
    const dynamicHeartSize = (100 - (config.STARTING_LIVES * 2) - 4) / config.STARTING_LIVES;
    const maxHeartSize = 24;
    const heartSize = dynamicHeartSize <= maxHeartSize ? dynamicHeartSize : maxHeartSize;

    statuses.push(
      <Rect
        key="bg"
        x={this.props.x + 96}
        y={this.props.y + 100}
        width={100}
        height={heartSize + 2}
        stroke="white"
        fill="#666666"
        cornerRadius={6}
      />
    );

    if (!this.props.player.isReady) {
      statuses.push(
        <Text
          key="not-ready"
          x={this.props.x + 103}
          y={this.props.y + 105}
          text="Not Ready"
          fill="white"
          fontSize={18}
        />
      );
    } else {
      const heartImage = new Image();
      heartImage.src = '/assets/images/heart.png';

      for (var i = 0; i < this.props.player.lives ; i++) {
        statuses.push(
          <KonvaImage
            key={i}
            y={this.props.y + 102}
            x={this.props.x + 100 + ((heartSize + 2) * i)}
            width={heartSize}
            height={heartSize}
            image={heartImage}
          />
        );
      }

      if (statuses.length === 1) {
        statuses.push(
          <Text
            key="not-ready"
            x={this.props.x + 101}
            y={this.props.y + 106}
            text="GAME OVER"
            fill="white"
            fontStyle="bold"
            fontSize={14.5}
          />
        );
      }
    }
 
    return statuses;
  }

  renderCoolDownIndicator = () => {

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
            height={92}
            stroke="white"
            fill={this.props.player.canBlink ? 'purple': '#666666'}
            cornerRadius={6}
          />
        )}
        {this.renderCoolDownIndicator()}
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
        {this.drawBottomStatus()}
      </React.Fragment>
    )
  }
}