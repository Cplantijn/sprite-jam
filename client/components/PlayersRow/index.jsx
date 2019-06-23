import React from 'react';
import config from '~config';
import PlayerStatus from '~components/PlayerStatus';

const DARK_BOTTOM_RATIO = 0.145; // Black area at bottom of screen

export default class PlayersRow extends React.PureComponent {
  render() {
    return config.PLAYERS.map((player, playerIndex) => {
      const matchedPlayer = this.props.activePlayers.find(p => p.name === player.name) || null;

      return (
        <PlayerStatus
          key={player.name}
          name={player.name}
          player={matchedPlayer}
          x={(playerIndex + 1) * 320}
          y={this.props.stageDimens.height - (this.props.stageDimens.height * DARK_BOTTOM_RATIO) + 5}
          height={this.props.stageDimens.height * DARK_BOTTOM_RATIO - 10}
        />
      );
    });
  }
}