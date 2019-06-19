import React from 'react';
import config from '~config';
import PlayerStatus from '~components/PlayerStatus';

const DARK_BOTTOM_RATIO = 0.145; // Black area at bottom of screen

export default class PlayersRow extends React.PureComponent {
  render() {
    return config.PLAYERS.map((player, playerIndex) => (
      <PlayerStatus
        key={player.name}
        name={player.name}
        active={!!this.props.activePlayers.find(p => p.name === player.name)}
        x={(playerIndex + 1) * 320}
        y={this.props.stageDimens.height - (this.props.stageDimens.height * DARK_BOTTOM_RATIO) + 5}
        height={this.props.stageDimens.height * DARK_BOTTOM_RATIO - 10}
      />
    ));
  }
}