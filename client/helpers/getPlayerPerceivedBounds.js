import config from '~config';

export default function (position) {
  const BASE_PLAYER_WIDTH = 86;

  return {
    start: position + ((BASE_PLAYER_WIDTH * config.PLAYER_SCALING) * .33),
    end: position + ((BASE_PLAYER_WIDTH * config.PLAYER_SCALING) * .66)
  }
}