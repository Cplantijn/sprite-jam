import React from 'react';
import { Rect } from 'react-konva';
import config from '~config';

const DARK_BOTTOM_RATIO = 0.145; // Black area at bottom of screen

export default class PlayerSelection extends React.PureComponent {
  render() {
    const players = [];

    for (let i = 0; i < config.PLAYER_COUNT; i++) {
      players.push(
        <Rect
          key={i}
          x={(i + 1) * 320}
          y={this.props.stageDimens.height - (this.props.stageDimens.height * DARK_BOTTOM_RATIO) + 5}
          width={300}
          height={this.props.stageDimens.height * DARK_BOTTOM_RATIO - 10}
          fill="white"
        />
      );
    }

    return players;
  }
}